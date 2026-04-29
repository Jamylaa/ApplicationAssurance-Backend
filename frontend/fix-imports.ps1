# Script PowerShell pour corriger tous les chemins d'import
$files = Get-ChildItem -Path "src\app" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remplacer les anciens chemins d'import
    $content = $content -replace "from '\.\./\.\./shared/services/", "from '../../../core/services/"
    $content = $content -replace "from '\.\./\.\./services/", "from '../../../core/services/"
    $content = $content -replace "from '\.\./\.\./models/", "from '../../../shared/models/"
    $content = $content -replace "from '\.\./\.\./shared/components/", "from '../../shared/components/"
    
    # Corriger les paramètres TypeScript any
    $content = $content -replace "next: \(res\) \{", "next: (res: any) {"
    $content = $content -replace "error: \(err\) \{", "error: (err: any) {"
    $content = $content -replace "next: \(client\) \{", "next: (client: any) {"
    $content = $content -replace "next: \(garantie\) \{", "next: (garantie: any) {"
    $content = $content -replace "next: \(contracts\) \{", "next: (contracts: any) {"
    $content = $content -replace "next: \(contract\) \{", "next: (contract: any) {"
    $content = $content -replace "next: \(details\) \{", "next: (details: any) {"
    $content = $content -replace "next: \(result\) \{", "next: (result: any) {"
    $content = $content -replace "next: \(response\) \{", "next: (response: any) {"
    $content = $content -replace "next: \(session\) \{", "next: (session: any) {"
    
    Set-Content $file.FullName $content -NoNewline
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "Import paths fixed!"
