# YouApp project skills

Install these four skills once per checkout. The versions pinned below are the team's baseline. Git ignores the downloaded folders under `.agents/skills/`. For how YouApp uses these skills during product development, see the [product development baseline](docs/product-development.md).

| Folder | When to use it | Source |
| --- | --- | --- |
| `taste-skill` | Review visual hierarchy and polish | [Taste Skill](https://github.com/Leonxlnx/taste-skill) |
| `caveman` | Give concise updates when requested | [Caveman](https://github.com/JuliusBrussee/caveman) |
| `graphify` | Trace dependencies and answer questions across the repo | [Graphify](https://github.com/graphify-labs/graphify) |
| `ui-ux-pro-max` | Design and review mobile flows, accessibility, and interaction | [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |

## Install from a fresh checkout

Run this PowerShell block from the repo root. It uses Python, `uvx`, and the Skill Installer included with Codex. The commands skip skills that already have a `SKILL.md`.

```powershell
$youappCodexDir = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex' }
$youappInstaller = Join-Path $youappCodexDir 'skills/.system/skill-installer/scripts/install-skill-from-github.py'
$youappSkills = Join-Path (Get-Location).Path '.agents/skills'

if (-not (Test-Path -LiteralPath $youappInstaller)) {
    throw 'The Skill Installer was not found. Check your Codex data directory or use the manual install below.'
}

$youappSources = @(
    @{ Name = 'taste-skill'; Repo = 'Leonxlnx/taste-skill'; Ref = 'f6b76575f949707b4e3c37cd86cb44b0b98643e8'; Path = 'skills/taste-skill' }
    @{ Name = 'caveman'; Repo = 'JuliusBrussee/caveman'; Ref = 'a192894723a8f47e7f504c7b5041967ff1f18e55'; Path = 'skills/caveman' }
    @{ Name = 'ui-ux-pro-max'; Repo = 'nextlevelbuilder/ui-ux-pro-max-skill'; Ref = '2de1134dc4d1cfe112934611ae5803ae17a1bd7e'; Path = '.claude/skills/ui-ux-pro-max' }
)

foreach ($youappSource in $youappSources) {
    $youappManifest = Join-Path $youappSkills "$($youappSource.Name)/SKILL.md"
    if (Test-Path -LiteralPath $youappManifest) { continue }

    python $youappInstaller --repo $youappSource.Repo --ref $youappSource.Ref --path $youappSource.Path --dest $youappSkills
    if ($LASTEXITCODE -ne 0) { throw "Installation failed for $($youappSource.Name)." }
}

if (-not (Test-Path -LiteralPath (Join-Path $youappSkills 'graphify/SKILL.md'))) {
    uvx --from graphifyy==0.9.112 graphify install --platform agents --project
    if ($LASTEXITCODE -ne 0) { throw 'Installation failed for Graphify.' }
}
```

For a manual install, copy each skill folder from its pinned GitHub revision to the matching folder in `.agents/skills/`. Copy the complete folder, including scripts, references, and data. Run the same `uvx` command from the repo root for Graphify. If an existing folder is incomplete, move it aside before retrying so the installer can create a fresh copy.

## Verify and use

Confirm that all four manifests exist from the repo root.

```powershell
Get-ChildItem .agents/skills/*/SKILL.md | Select-Object -ExpandProperty FullName
```

Start a new AI session from this repo after installation. If the agent does not load local skills automatically, give it this instruction.

> Read `SKILLS.md` and check which of the four skills are installed. Install missing skills using the pinned sources when authorized. Read the relevant local `SKILL.md` and follow it for the current task. Report any skill you could not load.

Run these CLI checks from the repo root when you need Graphify or UI/UX Pro Max.

```powershell
uvx --from graphifyy==0.9.112 graphify --help
python .agents/skills/ui-ux-pro-max/scripts/search.py --help
```

The project currently uses one pin per third-party skill. Review updates before changing the pins. Project-owned skills can use their own tracked directories under `.agents/skills/`.
