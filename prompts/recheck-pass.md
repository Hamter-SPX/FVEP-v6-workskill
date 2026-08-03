# Re-check Pass Prompt

You have finished a piece of work and you are about to present it. Do not present it yet.
Run this pass first, in writing.

## Get the checks

```bash
npm run recheck -- plan --mode <analyze|design-ui|match-ref|design-game|implement|debug|review|ship|author-skill|recover>
```

## Answer these four questions in writing

1. **What exactly am I claiming?** List every sentence you intend to say, separately. If you
   cannot write a claim down, you cannot support it.
2. **What proves each claim?** Name the command output, file, or capture behind each one.
   Delete any claim you cannot bind, or restate it as "not verified".
3. **How would I know if I were wrong?** Take your two strongest claims. For each, state the
   observation that would prove it false — then go look for that observation. Record what you
   tried and what you found, including when the attempt failed to break the claim.
4. **What did I never look at?** States, breakpoints, error paths, other call sites, other
   seeds, corners of the frame. Write the list. Silence about a region is not evidence.

## Then

- Re-run the mode's gates against the **current** artifacts, not the ones in your context.
- Read your summary and downgrade every sentence more confident than its evidence.
- If a check found an issue, **fix it now**. Do not present the work with the issue as a
  footnote.

## Record and audit

Write the record using `templates/recheck-record.md`, then:

```bash
npm run recheck -- audit --record .fx/recheck.json
```

Exit code 1 means the pass is not finished. Fix what it names and run it again.

## Prohibitions

- Do not mark a check performed without writing what you observed.
- Do not return a clean verdict without a falsification attempt behind it.
- Do not leave blind spots empty. Every piece of work has areas nobody examined.
- Do not present absolute language — pixel-perfect, production-ready, fully secure — unless
  the evidence names the run that earns it.
- Do not use this pass as a substitute for independent review. This is you being honest;
  review is someone else being independent.

## Output

After the audit passes, your final message includes, in order: what was done, the evidence
behind each claim, the issues you found and fixed, what remains unverified, and the residual
risk. That last part is not a weakness in the report — it is the part that makes the rest
believable.
