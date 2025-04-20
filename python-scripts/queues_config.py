# queue.py
from dataclasses import dataclass
from typing import Optional
from discord import ButtonStyle

@dataclass
class QueueDef:
    key: str
    pool_attr: str
    label: str
    style: ButtonStyle
    start_fn_name: str
    validation_fn_name: Optional[str] = None   # ← new!

# now only your high‑MMR queues get a validation callback
QUEUES = [
    QueueDef(
      "queue", "sigedUpPlayerPool", "Supreme-Radekomsa autobalance",
      ButtonStyle.blurple, "_check_pool_size_and_start"
    ),
    QueueDef(
      "queue_draft", "sigedUpDraftPlayerPool", "Supreme-Radekomsa draft",
      ButtonStyle.green, "_check_pool_size_and_start_draft"
    ),
    QueueDef(
      "queue_hmmr", "sigedUpHighMMRPool", "MMR 5.5k+ draft",
      ButtonStyle.primary, "_check_pool_size_and_start_hmmr",
      "validate_high_mmr"
    ),
    QueueDef(
      "queue_hmmr_bal", "sigedUpHighMMRBalancePool", "MMR 5.5k+ autobalance",
      ButtonStyle.secondary, "_check_pool_size_and_start_hmmr_balance",
      "validate_high_mmr_balance"
    ),
]
