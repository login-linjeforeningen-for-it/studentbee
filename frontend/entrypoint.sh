#!/bin/sh

# THIS IS THE FRONTEND ENTRYPOINT. SEE /api/entrypoint.sh FOR THE API ENTRYPOINT.

# Starts varnish
varnishd -a :3000 -f /etc/varnish/default.vcl -s malloc,512m &

echo "-------------------- NOTE --------------------"
echo ""
echo "SERVING CACHED PROJECT ON http://localhost:3000."
echo ""
echo "-------------------- NOTE --------------------"

# Starts Next.js — exec replaces sh as PID 1 so SIGTERM reaches bun directly
export PORT=3001
exec bun server.js
