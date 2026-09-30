# English ↔ French translator

This is a deliberately narrow, stateless web app. It sends no conversation
history: every submitted message is a new request. The model must return a
strict JSON shape, and the server renders only translation fields. This means
a question such as “Where is the market?” is translated rather than answered.

## Run locally

1. Create an OpenAI API key and keep it private.
2. In a terminal, from this folder, run:

   ```sh
   export OPENAI_API_KEY="your_key_here"
   python3 app.py
   ```

3. Open http://127.0.0.1:8000 in your browser.

The server uses only Python's standard library; there is nothing to install.
`OPENAI_MODEL` is optional and defaults to `gpt-6-luna`, a low-cost model suited
to this focused task. You may set it to another model if you prefer.

## Run with Docker (recommended)

Docker runs the service in an isolated container and starts it automatically if
your computer restarts.

1. Copy the example environment file and put your real key in it:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env` and add the key after `OPENAI_API_KEY=`. Keep this file private.

3. Build and start the service:

   ```sh
   docker compose up --build -d
   ```

4. Open http://127.0.0.1:8000.

Useful Docker commands:

```sh
docker compose logs -f       # view service logs
docker compose down          # stop the service
docker compose up -d         # start it again
```

The container runs as a non-root user, is read-only, has no Linux capabilities,
and accepts connections only from your own computer. Do not change the port
mapping to `0.0.0.0:8000` unless you also add authentication and HTTPS.

## If translation does not work

- **`OPENAI_API_KEY is not configured`**: stop the app with `Ctrl+C`, run the
  `export OPENAI_API_KEY=...` command in the same terminal, and start it again.
  A running app cannot see variables exported after it was started.
- **`Could not reach api.openai.com`**: this is an internet or DNS issue, not an
  API-key issue. Check that your computer is online, then try in Terminal:

  ```sh
  curl -I https://api.openai.com
  ```

  If that cannot resolve the address, reconnect your Wi-Fi/data connection or
  try a different network. A work/school network or VPN may also block the API.
- **`HTTP 401`**: the key is incorrect, disabled, or was not copied completely.
- **`HTTP 429`**: add API credit or wait for the rate limit to reset.

## Important design choices

- The browser never receives the API key.
- `store: false` is sent with each API request.
- The app keeps no conversation history and logs no submitted text.
- The response format is JSON Schema, so the UI cannot show model explanations.
- English shows corrected English then French. French shows English only.
- Requests are size-limited and rate-limited; responses include security headers.
- `/health` is available for Docker's health check and contains no secrets.

## Tests

Install development dependencies, then run:

```sh
python3 -m pip install -r requirements-dev.txt
python3 -m pytest
```

For a public deployment, add authentication and rate limiting before exposing
the endpoint; otherwise, other people could use your API account.
