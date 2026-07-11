# Run this script as Administrator (Right-click → Run as Administrator)
$taskName   = "BizFlow-DB-Backup"
$scriptPath = "E:\2026\BizFlow\scripts\backup-db.mjs"
$nodePath   = (Get-Command node -ErrorAction Stop).Source
$workDir    = "E:\2026\BizFlow"

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$action   = New-ScheduledTaskAction -Execute $nodePath -Argument $scriptPath -WorkingDirectory $workDir
$trigger  = New-ScheduledTaskTrigger -Daily -DaysInterval 2 -At "02:00AM"
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -StartWhenAvailable -RunOnlyIfNetworkAvailable
$principal= New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Highest -LogonType S4U

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "BizFlow Supabase DB backup every 2 days" -Force

Write-Host "`nTask '$taskName' registered successfully!" -ForegroundColor Green
Write-Host "Runs every 2 days at 2:00 AM"
Write-Host "Backups saved to: E:\2026\BizFlow\backup\"
