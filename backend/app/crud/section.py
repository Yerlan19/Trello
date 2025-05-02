from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete

from app.domain import Section, Card, Board
from app.domain.schemas import SectionCreate, SectionUpdate
from fastapi import HTTPException, status

async def get_card(db: AsyncSession, card_id: int):
    result = await db.execute(select(Card).filter(Card.id == card_id))
    db_card = result.scalars().first()
    return db_card


async def get_section(db: AsyncSession, section_id: int) -> Section | None:
    stmt = (
        select(Section)
        .options(selectinload(Section.board))
        .where(Section.id == section_id)
    )
    res = await db.execute(stmt)
    return res.scalars().first()


async def create_section(db: AsyncSession, section: SectionCreate, customer_id: int):
    result = await db.execute(select(Board).filter(Board.id == section.board_id))
    db_board = result.scalars().first()

    if not db_board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")

    if db_board.customer_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not have permission to add section to this board")

    if section.position is None:
        result = await db.execute(
            select(Section).filter(Section.board_id == section.board_id).order_by(Section.position.desc()))
        last_section = result.scalars().first()
        position = last_section.position + 1 if last_section else 0
    else:
        position = section.position

    db_section = Section(title=section.title, board_id=section.board_id, position=position)
    db.add(db_section)
    await db.commit()
    await db.refresh(db_section)
    return db_section


async def update_section(
    db: AsyncSession,
    section_id: int,
    new_title: str,                # принимаем сразу строку
    customer_id: int
):
    stmt = (
        select(Section)
        .options(selectinload(Section.board))
        .where(Section.id == section_id)
    )
    res = await db.execute(stmt)
    db_section = res.scalars().first()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")

    if db_section.board.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_section.title = new_title   # присваиваем строку
    await db.commit()
    await db.refresh(db_section)
    return db_section

async def delete_section(db: AsyncSession, section_id: int, customer_id: int):
    db_section = await get_section(db, section_id)
    if not db_section:
        raise HTTPException(404, "Section not found")
    if db_section.board.customer_id != customer_id:
        raise HTTPException(403, "Forbidden")

    await db.execute(delete(Card).where(Card.section_id == section_id))
    await db.delete(db_section)
    await db.commit()
    return db_section


async def move_card(db: AsyncSession, card_id: int, section_id: int, position: int, customer_id: int):
    db_card = await get_card(db, card_id)
    if not db_card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

    if db_card.section.board.customer_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to move this card")

    db_card.section_id = section_id
    db_card.position = position
    await db.commit()
    await db.refresh(db_card)
    return db_card


async def get_sections_for_board(db: AsyncSession, board_id: int):
    result = await db.execute(select(Section).filter(Section.board_id == board_id))
    db_sections = result.scalars().all()
    return db_sections


async def move_section(db: AsyncSession, section_id: int, position: int, customer_id: int):
    stmt = (
        select(Section)
        .options(selectinload(Section.board))
        .where(Section.id == section_id)
    )
    res = await db.execute(stmt)
    db_section = res.scalars().first()

    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")

    if db_section.board.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_section.position = position
    await db.commit()
    await db.refresh(db_section)
    return db_section
