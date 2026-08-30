# Verification Agent Trajectory

## Agent

Verification Agent

## Purpose

Act as a quality gate before producing the final implementation plan.

## Input

- Original developer task
- Analysis Agent output

## Checks

The agent checks for:

- missing requirements
- incorrect assumptions
- technical risks
- contradictions
- important edge cases

## Decision

The agent must explicitly produce:

VERIFICATION: PASS

or

VERIFICATION: NEEDS IMPROVEMENT

## Handoff

The verification output is provided to the Final Solution Agent.

## Design Reason

The verification stage creates an explicit review boundary instead of relying only on the final agent to evaluate its own answer.