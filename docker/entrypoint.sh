#!/bin/sh
set -eu
umask 077
# A newly mounted Fly volume is root-owned. Touch only our own directory,
# never the volume root, lost+found, or unrelated backups.
if [ "$(id -u)" = '0' ]; then
  if [ -L /data/klassno ]; then
    echo 'Refusing a symlink for the application data directory.' >&2
    exit 1
  fi
  mkdir -p /data/klassno
  chown node:node /data/klassno
  chmod 700 /data/klassno
  for file in /data/klassno/klassno.sqlite /data/klassno/klassno.sqlite-wal /data/klassno/klassno.sqlite-shm; do
    if [ -L "$file" ]; then
      echo 'Refusing a symlink for a database file.' >&2
      exit 1
    fi
    if [ -f "$file" ]; then
      chown node:node "$file"
      chmod 600 "$file"
    fi
  done
  exec gosu node:node "$@"
fi
exec "$@"
