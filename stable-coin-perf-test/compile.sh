#!/usr/bin/env bash

# hedera/
python3 -m grpc_tools.protoc -I . --python_out . --grpc_python_out . hedera/*.proto

# stablecoin/
python3 -m grpc_tools.protoc -I . --python_out . --grpc_python_out . stablecoin/*.proto
