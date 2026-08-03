# GitHub Actions Integration

The bundled workflow is a concrete starting point. Align these project-specific values before enabling it:

- Application dependency command
- Development or preview server command
- Ready URL and port
- Location of the skill directory
- Location of `vision-loop.config.json`
- Artifact output path
- Whether exact-reference baseline verification applies

The pull-request job uses the automated-only quality gate. A release job should additionally validate the current semantic review and run the quality gate without `--automated-only`.

Do not make CI rewrite baselines. Upload evidence after failure and promote a new baseline only through explicit review.
