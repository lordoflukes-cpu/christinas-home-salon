"""Shared kill-switch state: a block-new flag. Flattening is a venue action the service /
command handler performs (venue.flatten_all) when engaging."""

from __future__ import annotations


class KillSwitch:
    def __init__(self) -> None:
        self.engaged = False

    def engage(self) -> None:
        self.engaged = True

    def release(self) -> None:
        self.engaged = False

    @property
    def blocked(self) -> bool:
        return self.engaged
