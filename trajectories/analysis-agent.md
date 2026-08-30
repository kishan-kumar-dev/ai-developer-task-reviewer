# Analysis Agent Trajectory

## Agent

Analysis Agent

## Purpose

Convert research into a practical implementation strategy.

## Input

- Original developer task
- Research Agent output

## Instruction

The agent identifies:

- goal
- functional requirements
- technical requirements
- implementation steps
- edge cases

It must not invent requirements unsupported by the original task.

## Handoff

The resulting analysis is passed to the Verification Agent.

## Design Reason

Separating analysis from research prevents requirement discovery and implementation planning from being treated as the same operation.