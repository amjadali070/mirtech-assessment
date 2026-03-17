from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, text
from sqlalchemy.sql import func
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_name = Column(String, index=True)
    category = Column(String, index=True)
    amount = Column(Float)
    status = Column(String, index=True)  # completed, pending, failed
    is_fraudulent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
