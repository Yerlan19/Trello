from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.domain import Board, Section
from app.domain.schemas import BoardCreate, BoardUpdate
from fastapi import HTTPException, status


async def get_board_with_sections(db: AsyncSession, board_id: int):
    stmt = (
        select(Board)
        .where(Board.id == board_id)
        .options(
            selectinload(Board.sections)
              .selectinload(Section.cards)
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_board(db: AsyncSession, board_id: int):
    result = await db.execute(select(Board).filter(Board.id == board_id))
    db_board = result.scalars().first()
    return db_board


async def get_boards_for_user(db: AsyncSession, user_id: int):
    stmt = (
        select(Board)
        .where(Board.customer_id == user_id)
        .options(
            selectinload(Board.sections)
                .selectinload(Section.cards)   # <-- и здесь!
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_board(db: AsyncSession, board: BoardCreate, customer_id: int):
    db_board = Board(title=board.title, customer_id=customer_id)
    db.add(db_board)
    await db.commit()
    await db.refresh(db_board)
    return db_board


async def update_board(db: AsyncSession, board_id: int, board: BoardUpdate, customer_id: int):
    db_board = await get_board(db, board_id)
    if not db_board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")

    if db_board.customer_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not have permission to edit this board")

    db_board.title = board.title
    await db.commit()
    await db.refresh(db_board)
    return db_board


async def delete_board(db: AsyncSession, board_id: int, customer_id: int):
    db_board = await get_board(db, board_id)
    if not db_board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")

    if db_board.customer_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not have permission to delete this board")

    await db.delete(db_board)
    await db.commit()
    return db_board
