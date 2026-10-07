#!/usr/bin/env bash
FLOW_NAME="$1"
if [ -z "$FLOW_NAME" ]; then
  echo "Usage: run_flow.sh <flow-name>"
  exit 1
fi

FLOW_DIR="/Users/a2250/Research/apps/app/.maestro/$FLOW_NAME"
if [ ! -d "$FLOW_DIR" ]; then
  echo "Flow directory not found: $FLOW_DIR"
  exit 1
fi

echo "Running Maestro flow: $FLOW_NAME"
if [ -f "$FLOW_DIR/$FLOW_NAME-script.sh" ]; then
  bash "$FLOW_DIR/$FLOW_NAME-script.sh"
else
  maestro test "$FLOW_DIR/$FLOW_NAME-test.yaml"
fi
