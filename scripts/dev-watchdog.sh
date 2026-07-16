#!/bin/bash
# Watchdog script that keeps the Next.js dev server alive.
# Polls the server health every 10s and restarts if it dies.

cd /home/z/my-project
PORT=3000
HEAP=768

start_server() {
  echo "[$(date +%H:%M:%S)] Starting dev server (heap=${HEAP}MB)..."
  NODE_OPTIONS="--max-old-space-size=${HEAP}" nohup bunx next dev -p $PORT > dev.log 2>&1 &
  echo $!
}

wait_for_ready() {
  for i in $(seq 1 30); do
    sleep 2
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null | grep -q "200"; then
      echo "[$(date +%H:%M:%S)] Server ready after ${i}x2s"
      # Warm up session route too
      curl -s -o /dev/null http://localhost:$PORT/api/auth/session 2>/dev/null
      return 0
    fi
  done
  echo "[$(date +%H:%M:%S)] Server failed to start within 60s"
  return 1
}

# Main loop
while true; do
  # Kill any existing server
  pkill -f "next-server" 2>/dev/null
  pkill -f "bunx next" 2>/dev/null
  sleep 2

  # Start fresh
  rm -rf .next 2>/dev/null
  start_server
  wait_for_ready

  if [ $? -eq 0 ]; then
    echo "[$(date +%H:%M:%S)] Server is live. Monitoring..."
    # Poll every 10s; restart if dead
    while true; do
      sleep 10
      if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null | grep -q "200"; then
        echo "[$(date +%H:%M:%S)] Server is down. Will restart..."
        break
      fi
    done
  fi

  echo "[$(date +%H:%M:%S)] Restarting in 3s..."
  sleep 3
done
