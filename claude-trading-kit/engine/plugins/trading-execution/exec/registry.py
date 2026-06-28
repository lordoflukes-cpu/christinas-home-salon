"""Venue registry — pick the venue for a track from config, caching instances so positions
persist. Default: PaperVenue for both tracks (no creds). Real venues are constructed with
their creds and raise a clear error if used unconfigured."""

from __future__ import annotations

from .config import Settings, settings as default_settings
from .ig_venue import IGVenue
from .metaapi_venue import MetaApiVenue
from .mt5_venue import MT5Venue
from .paper_venue import PaperVenue


class Registry:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or default_settings
        self._cache: dict[str, object] = {}

    def _build(self, track: str):
        s = self.settings
        name = s.cfd_venue if track == "cfd" else s.spreadbet_venue
        if name == "paper":
            return PaperVenue(equity0=s.equity0, track=track)
        if name == "metaapi":
            return MetaApiVenue(s.metaapi_token, s.metaapi_account)
        if name == "mt5":
            return MT5Venue(s.mt5_login, s.mt5_password, s.mt5_server)
        if name == "ig":
            return IGVenue(s.ig_api_key, s.ig_username, s.ig_password, s.ig_account)
        raise ValueError(f"unknown venue '{name}' for track '{track}'")

    def venue(self, track: str):
        """Return the (cached) venue for a track ('cfd' | 'spreadbet')."""
        if track not in ("cfd", "spreadbet"):
            raise ValueError(f"unknown track '{track}'")
        if track not in self._cache:
            self._cache[track] = self._build(track)
        return self._cache[track]

    def all_venues(self) -> list:
        return [self.venue("cfd"), self.venue("spreadbet")]
