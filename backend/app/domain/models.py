from sqlalchemy import String, Integer, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime


from .base import Base


class Customer(Base):
    __tablename__ = 'customer'

    username: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    created_date: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    updated_date: Mapped[datetime] = mapped_column(TIMESTAMP, onupdate=datetime.utcnow)

    boards: Mapped[list["Board"]] = relationship("Board", back_populates="customer")


class Board(Base):
    __tablename__ = 'boards'

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="boards")
    sections: Mapped[list["Section"]] = relationship(
        "Section",
        back_populates="board",
        order_by="Section.position",
        lazy="selectin",
    )



class Section(Base):
    __tablename__ = 'sections'

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    board_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey('boards.id', ondelete='CASCADE'),
        nullable=False
    )

    # <-- здесь back_populates="sections" у Board, а у Section указываем cards:
    board: Mapped["Board"] = relationship(
        "Board",
        back_populates="sections",
        lazy="selectin"
    )
    cards: Mapped[list["Card"]] = relationship(
        "Card",
        back_populates="section",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class Card(Base):
    __tablename__ = 'cards'

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    section_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey('sections.id', ondelete='CASCADE'),
        nullable=False
    )

    # <-- вот этот атрибут должен называться ровно так же, как указан в back_populates:
    section: Mapped["Section"] = relationship(
        "Section",
        back_populates="cards",
        lazy="joined"
    )
