@echo off
setlocal enabledelayedexpansion

echo Fixing import paths...

REM Fix shared/services imports to core/services
for /r "src\app" %%f in (*.ts) do (
    powershell -Command "(Get-Content '%%f') -replace 'from '\''../../shared/services/',''from '../../../core/services/' -replace 'from '\''../../services/',''from '../../../core/services/' -replace 'from '\''../../models/',''from '../../../shared/models/' -replace 'from '\''../../shared/components/',''from '../../shared/components/' | Set-Content '%%f'"
)

echo Import paths fixed!
pause
