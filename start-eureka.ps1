$env:JAVA_HOME = "C:\Users\ghayt\.jdks\openjdk-24.0.1"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Set-Location "$PSScriptRoot\Eureka"
Write-Host "=== Starting Eureka (port 8761) ===" -ForegroundColor Cyan
Write-Host "Using Java: $(& java -version 2>&1 | Select-Object -First 1)"
.\mvnw.cmd spring-boot:run -DskipTests
