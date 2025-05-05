from fastapi import (
    Depends,
    APIRouter,
    status,
    HTTPException,
    Query,
    Form
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import Body

from app.core.db import db_helper
from app.crud.auth import login_user, get_current_user
from app.crud.board import get_boards_for_user, create_board, get_board, update_board, delete_board, \
    get_board_with_sections
from app.crud.card import create_card, delete_card, move_card, update_card
from app.crud.section import delete_section, update_section, create_section
from app.domain import schemas, Section
from app.security.utils import create_access_token
from app.crud.section import move_section


router = APIRouter()


@router.post("/sign-in", response_model=schemas.Token)
async def login(user: schemas.User, session: AsyncSession = Depends(db_helper.session_getter)):
    db_user = await login_user(user.username, user.password, session)

    access_token = create_access_token(data={"sub": user.username})

    return {"token": access_token, "token_type": "bearer"}


@router.get("/boards", response_model=list[schemas.BoardRead])
async def get_my_boards(session: AsyncSession = Depends(db_helper.session_getter), current_user = Depends(get_current_user)):
    boards = await get_boards_for_user(session, current_user.id)

    if not boards:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No boards found for the current user"
        )

    return boards


@router.post("/boards", response_model=schemas.BoardBase)
async def create_board_route(
    title: str = Query(...),
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user = Depends(get_current_user)
):
    board_data = schemas.BoardCreate(title=title)
    db_board = await create_board(session, board_data, current_user.id)
    return db_board


@router.get("/boards/{board_id}", response_model=schemas.BoardRead)
async def get_board_route(
        board_id: int,
        session: AsyncSession = Depends(db_helper.session_getter),
        current_user=Depends(get_current_user)
):
    db_board = await get_board_with_sections(session, board_id)
    if not db_board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")

    if db_board.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not have permission to view this board")

    return db_board


@router.put("/boards/{board_id}", response_model=schemas.BoardBase)
async def update_board_route(
    board_id: int,
    newTitle: str = Query(...),
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user = Depends(get_current_user)
):
    db_board = await get_board(session, board_id)

    if db_board is None:
        raise HTTPException(status_code=404, detail="Board not found")

    if db_board.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this board")

    db_board = await update_board(session, board_id,  schemas.BoardUpdate(title=newTitle), current_user.id)

    return db_board


@router.delete("/boards/{board_id}", response_model=schemas.BoardRead)
async def get_board_route(
    board_id: int,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user=Depends(get_current_user)
):
    board = await get_board_with_sections(session, board_id)
    if not board:
        raise HTTPException(404, "Board not found")
    if board.customer_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    return board


@router.post("/sections", response_model=schemas.SectionRead)
async def create_section_route(
    title: str = Form(...),
    boardId: int = Form(...),
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user = Depends(get_current_user)
):
    section_in = schemas.SectionCreate(title=title, boardId=boardId)
    return await create_section(session, section_in, current_user.id)

@router.put("/sections/{section_id}", response_model=schemas.SectionRead)
async def update_section_route(
    section_id: int,
    title: str = Query(..., alias="newTitle"),
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user=Depends(get_current_user),
):
    return await update_section(session, section_id, title, current_user.id)

@router.delete("/sections/{section_id}", response_model=schemas.SectionRead)
async def delete_section_route(
    section_id: int,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user = Depends(get_current_user)
):
    db_section = await delete_section(session, section_id, current_user.id)
    return db_section


@router.post("/cards", response_model=schemas.CardRead)
async def create_card_route(
    sectionId: int = Query(...),
    title:     str = Query(...),
    session:   AsyncSession = Depends(db_helper.session_getter),
    user = Depends(get_current_user),
):
    card = await create_card(session, sectionId, schemas.CardCreate(title=title), user.id)
    return card

@router.put("/cards/{card_id}", response_model=schemas.CardRead)
async def update_card_route(
    card_id: int,
    card_in: schemas.CardUpdate = Body(...),
    session: AsyncSession = Depends(db_helper.session_getter),
    user = Depends(get_current_user),
):
    return await update_card(session, card_id, card_in, user.id)



@router.delete("/cards/{card_id}", response_model=schemas.CardRead)
async def delete_card_route(
    card_id: int,
    session: AsyncSession = Depends(db_helper.session_getter),
    user = Depends(get_current_user),
):
    return await delete_card(session, card_id, user.id)


@router.put("/cards/{card_id}/move", response_model=schemas.CardRead)
async def move_card_route(
    card_id: int,
    sectionId:   int = Query(...),
    position:    int = Query(...),
    session: AsyncSession = Depends(db_helper.session_getter),
    user = Depends(get_current_user),
):
    return await move_card(session, card_id, sectionId, position, user.id)

@router.put("/sections/{section_id}/move", response_model=schemas.SectionRead)
async def move_section_route(
    section_id: int,
    position: int = Query(...),
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user = Depends(get_current_user)
):
    # Получаем секцию
    section = await session.get(Section, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    # Проверка доступа
    if section.board.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Обновляем позицию
    section.position = position
    await session.commit()
    await session.refresh(section)

    return section
