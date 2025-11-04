# SOLUÇÃO: Encoding UTF-8 no PowerShell Windows

**Data:** 04/11/2025  
**Problema:** Caminhos com "Área de Trabalho" causam erro no PowerShell

---

## ❌ PROBLEMA

```powershell
cd "C:\Users\caiqu\OneDrive\Backup One Drive\Área de Trabalho\Sistemas"
# ERRO: Não é possível localizar o caminho 'C:\Users\caiqu\...Ãrea...'
```

**Causa:** Encoding UTF-8 não funciona corretamente mesmo com:
- `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`
- Aspas simples ou duplas
- Escape characters

---

## ✅ SOLUÇÃO FUNCIONAL

### Estratégia: Usar Get-ChildItem para encontrar pastas dinamicamente

```powershell
# 1. Definir caminho base (sem caracteres especiais)
$base = "C:\Users\caiqu\OneDrive\Backup One Drive"

# 2. Buscar pasta com padrão (ignora encoding)
$dir = Get-ChildItem $base | Where-Object {$_.Name -like "*rea*"} | Select-Object -First 1

# 3. Construir caminho completo
$workspace = Join-Path $dir.FullName "Sistemas"

# 4. Navegar usando Push-Location
Push-Location $workspace

# 5. Usar caminhos RELATIVOS a partir daqui
robocopy "loja.businesseducation.com.br\stores\s4vwcb5f-capec\css" "sistemas-businesseducation\public\loja\css" *.css /S

# 6. Voltar
Pop-Location
```

---

## 🎯 COMANDO COMPLETO FUNCIONAL

```powershell
$base = "C:\Users\caiqu\OneDrive\Backup One Drive";
$dir = Get-ChildItem $base | Where-Object {$_.Name -like "*rea*"} | Select-Object -First 1;
$workspace = Join-Path $dir.FullName "Sistemas";
Write-Host "Workspace: $workspace" -ForegroundColor Yellow;
Push-Location $workspace;

# COPIAR CSS
robocopy "loja.businesseducation.com.br\stores\s4vwcb5f-capec\css" "sistemas-businesseducation\public\loja\css" *.css /S /NP /NJH /NJS;

# COPIAR JS
robocopy "loja.businesseducation.com.br\stores\s4vwcb5f-capec\js" "sistemas-businesseducation\public\loja\js" *.js /S /NP /NJH /NJS;

Pop-Location
```

---

## 📋 PARÂMETROS ROBOCOPY ÚTEIS

| Parâmetro | Função |
|-----------|--------|
| `/S` | Copia subdiretórios (exceto vazios) |
| `/E` | Copia subdiretórios (incluindo vazios) |
| `/NP` | Sem progresso (mais rápido) |
| `/NJH` | Sem header |
| `/NJS` | Sem summary |
| `/NFL` | Sem lista de arquivos |
| `/NDL` | Sem lista de diretórios |

---

## ✅ RESULTADO OBTIDO

```
=== SUCESSO! ===
9 arquivos CSS copiados (185 KB)
8 arquivos JS copiados (542 KB)
```

---

## 🔑 LIÇÕES APRENDIDAS

1. **NÃO usar caminhos absolutos com caracteres especiais**
2. **SIM usar Get-ChildItem com wildcards** (`*rea*`)
3. **SIM usar caminhos relativos** após Push-Location
4. **ROBOCOPY é MELHOR que Copy-Item** para múltiplos arquivos
5. **Push-Location/Pop-Location** mantém contexto limpo

---

## 🚀 APLICAÇÃO FUTURA

Sempre que precisar acessar "Área de Trabalho" ou pastas com acentos:

```powershell
# Template genérico
$base = "C:\Users\caiqu\OneDrive\Backup One Drive"
$targetFolder = Get-ChildItem $base | Where-Object {$_.Name -like "*pattern*"} | Select-Object -First 1
Push-Location $targetFolder.FullName
# ... fazer operações com caminhos relativos ...
Pop-Location
```

---

**Documento criado por:** Cursor AI  
**Problema resolvido em:** 04/11/2025 00:58  
**Tempo para solução:** ~15 minutos de debugging

