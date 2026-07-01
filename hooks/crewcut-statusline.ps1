# Adapted from ponytail (https://github.com/DietrichGebert/ponytail, MIT,
# (c) 2026 DietrichGebert) — see /NOTICE.md.
# CLAUDE_CONFIG_DIR overrides ~/.claude, matching where the hooks write the flag
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$Flag = Join-Path $ClaudeDir ".crewcut-active"
if (-not (Test-Path $Flag)) {
    exit 0
}

$Mode = ""
try {
    $Mode = (Get-Content $Flag -ErrorAction Stop | Select-Object -First 1).Trim()
} catch {
    exit 0
}

$Esc = [char]27
if ([string]::IsNullOrEmpty($Mode) -or $Mode -eq "full") {
    [Console]::Write("${Esc}[38;5;73m[CREWCUT]${Esc}[0m")
} else {
    $Suffix = $Mode.ToUpperInvariant()
    [Console]::Write("${Esc}[38;5;73m[CREWCUT:$Suffix]${Esc}[0m")
}
