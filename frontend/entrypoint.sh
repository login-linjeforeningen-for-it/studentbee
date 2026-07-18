#!/bin/sh

# THIS IS THE FRONTEND ENTRYPOINT. SEE /api/entrypoint.sh FOR THE API ENTRYPOINT.

# Starts varnish
varnishd -a :3000 -f /etc/varnish/default.vcl -s malloc,512m &

echo "-------------------- NOTE --------------------"
echo ""
echo "SERVING CACHED PROJECT ON http://localhost:3000."
echo ""
echo "-------------------- NOTE --------------------"

# Starts API
PORT=3001 bun server.js
