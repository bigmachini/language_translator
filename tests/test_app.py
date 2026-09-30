import app as translator


def client(monkeypatch):
    application = translator.create_app()
    application.config.update(TESTING=True)
    return application.test_client()


def test_health_is_public(monkeypatch):
    response = client(monkeypatch).get("/health")
    assert response.status_code == 200
    assert response.json == {"status": "ok"}


def test_translation_requires_json_message(monkeypatch):
    response = client(monkeypatch).post("/api/translate", json={})
    assert response.status_code == 400
    assert "Enter some" in response.json["error"]


def test_translation_returns_only_expected_fields(monkeypatch):
    monkeypatch.setattr(
        translator,
        "api_translation",
        lambda _message: {
            "source_language": "english",
            "corrected_english": "This is a test.",
            "french": "Ceci est un test.",
        },
    )
    response = client(monkeypatch).post("/api/translate", json={"message": "This is a test"})
    assert response.status_code == 200
    assert response.json == {
        "source_language": "english",
        "corrected_english": "This is a test.",
        "french": "Ceci est un test.",
    }


def test_security_headers_are_set(monkeypatch):
    response = client(monkeypatch).get("/")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["Cache-Control"] == "no-store"
