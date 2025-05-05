from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.domain import Card, Section
from app.domain.schemas import CardCreate, CardUpdate

async def get_card(db: AsyncSession, card_id: int) -> Card | None:
    stmt = (
        select(Card)
        .options(selectinload(Card.section).selectinload(Section.board))
        .where(Card.id == card_id)
    )
    res = await db.execute(stmt)
    return res.scalars().first()

async def create_card(
    db: AsyncSession,
    section_id: int,
    card_in: CardCreate,
    customer_id: int
) -> Card:
    res = await db.execute(
        select(Section).options(selectinload(Section.board)).where(Section.id == section_id)
    )
    section = res.scalars().first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    if section.board.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    last = await db.execute(
        select(Card).where(Card.section_id == section_id).order_by(Card.position.desc())
    )
    last_card = last.scalars().first()
    pos = (last_card.position + 1) if last_card else 0

    db_card = Card(
        title=card_in.title,
        section_id=section_id,
        position=pos
    )
    db.add(db_card)
    await db.commit()
    await db.refresh(db_card)
    return db_card

async def update_card(
    db: AsyncSession,
    card_id: int,
    card_in: CardUpdate,
    customer_id: int
) -> Card:
    card = await get_card(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.section.board.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    card.title = card_in.title
    card.description = card_in.description  # ← если ты используешь поле description в модели

    await db.commit()
    await db.refresh(card)
    return card

async def delete_card(
    db: AsyncSession,
    card_id: int,
    customer_id: int
) -> Card:
    card = await get_card(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.section.board.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await db.delete(card)
    await db.commit()
    return card

async def move_card(
    db: AsyncSession,
    card_id: int,
    new_section_id: int,
    new_position: int,
    customer_id: int
) -> Card:
    card = await get_card(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.section.board.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    card.section_id = new_section_id
    card.position = new_position
    await db.commit()
    await db.refresh(card)
    return card
