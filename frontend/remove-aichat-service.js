const fs = require('fs');
const path = require('path');

function removeAiChatService(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      removeAiChatService(fullPath);
    } else if (file.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Remove AiChatService imports
      if (content.includes('AiChatService')) {
        content = content.replace(/import\s*\{[^}]*AiChatService[^}]*\}\s*from\s*['"][^'"]*['"];?\s*\n/g, '');
        content = content.replace(/private readonly aiChatService:\s*AiChatService,?\s*\n/g, '');
        content = content.replace(/private aiChatService:\s*AiChatService,?\s*\n/g, '');
        content = content.replace(/aiChatService\./g, '// aiChatService.');
        content = content.replace(/,\s*AiChatService/g, '');
        content = content.replace(/AiChatService,\s*/g, '');
        
        // Remove from providers
        content = content.replace(/providers:\s*\[[^\]]*AiChatService[^\]]*\]/g, 'providers: []');
        content = content.replace(/,\s*AiChatService/g, '');
        content = content.replace(/AiChatService,\s*/g, '');
        
        modified = true;
        console.log(`Removed AiChatService from: ${fullPath}`);
      }
      
      // Fix missing required properties in entity objects
      if (content.includes('const garantie: Garantie = {')) {
        content = content.replace(/const garantie: Garantie = \{([^}]+)\}/g, 
          'const garantie: Garantie = {$1, idGarantie: \'\', typeMontant: \'FORFAIT\', typePlafond: \'ANNUEL\', plafondMensuel: 0, dateCreation: new Date().toISOString(), dateModification: new Date().toISOString()}');
        modified = true;
      }
      
      if (content.includes('const pack: Pack = {')) {
        content = content.replace(/const pack: Pack = \{([^}]+)\}/g, 
          'const pack: Pack = {$1, idPack: \'\', ancienneteContratMois: 0, dureeMinContrat: 12, dureeMaxContrat: 12, niveauCouverture: \'STANDARD\' as any, dateCreation: new Date().toISOString(), dateModification: new Date().toISOString(), garanties: []}');
        modified = true;
      }
      
      if (content.includes('const produit: Produit = {')) {
        content = content.replace(/const produit: Produit = \{([^}]+)\}/g, 
          'const produit: Produit = {$1, idProduit: \'\', dateCreation: new Date().toISOString(), dateModification: new Date().toISOString()}');
        modified = true;
      }
      
      // Fix idUser property issue
      content = content.replace(/currentUser\?\.idUser/g, 'currentUser?.id');
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

removeAiChatService('./src/app');
console.log('AiChatService references removed!');
