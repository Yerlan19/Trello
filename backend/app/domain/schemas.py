from pydantic import BaseModel, Field
from typing import Optional, List

class User(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    token: str
    token_type: str


class CardRead(BaseModel):
    id: int
    title: str
    position: int

    model_config = {"from_attributes": True}


class SectionRead(BaseModel):
    id: int
    title: str
    position: int
    cards: List[CardRead] = []

    model_config = {"from_attributes": True}


class BoardBase(BaseModel):
    title: str


class BoardCreate(BoardBase):
    pass


class BoardUpdate(BoardBase):
    pass


class BoardRead(BaseModel):
    id: int
    title: str

    sections: List[SectionRead] = []

    model_config = {"from_attributes": True}


class Board(BoardBase):
    id: int
    customer_id: int

    class Config:
        orm_mode = True


class SectionCreate(BaseModel):
    title: str
    board_id: int = Field(..., alias="boardId")
    position: Optional[int] = None


class SectionUpdate(BaseModel):
    title: str


class CardCreate(BaseModel):
    title: str

class CardUpdate(BaseModel):
    title: str
    description: Optional[str] = None  

