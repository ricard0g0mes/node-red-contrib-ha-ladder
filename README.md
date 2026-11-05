# node-red-contrib-ha-ladder

![platform](https://img.shields.io/badge/platform-Node--RED-red)
![platform](https://img.shields.io/badge/platform-Home%20Assistant-41BDF5)

<a href="https://www.buymeacoffee.com/ricard0g0mes"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy me a coffee" width="200"></a>

If you like my work and find it helpful, please support me with a small donation.

**[English](#english)** · **[Português](#português)**

Ladder logic (IEC 61131-3 style) for **Node-RED**, using **Home Assistant entities** as digital inputs/outputs.

Palette: **`ha-ladder`** / **`ha-ladder-sys`**.

---

## Attribution / Based on redPlc

This package is a **fork/adaptation** of the excellent **redPlc** work:

- Original package: [`@redplc/node-red-redplc`](https://www.npmjs.com/package/@redplc/node-red-redplc)
- Repository: **https://github.com/redplc/redplc**
- License: **Apache-2.0** (kept in this fork)

Most of the ladder logic (scan, rail, contact/coil modes, function, counter, timer, flipflop, move, math, scale, compare, `M`/`MA` memory) comes from redPlc.  
This fork mainly changes **I/O**: instead of GPIO / `I` / `Q`, contact/coil talk to **HA entities**.

If you use ladder in Node-RED, please also support the upstream project: [redplc/redplc](https://github.com/redplc/redplc).

---

## Author

**Ricardo Gomes** — https://ricardogomes.eu

---

<a id="english"></a>

# English

## What changes vs redPlc

| redPlc | HA Ladder |
|--------|-----------|
| `I` / `Q` via GPIO modules | HA entities on **contact** / **coil** |
| `import` / `export` | Not needed for digital HA I/O |
| Addresses like `M0.0` as external I/O | `entity_id` such as `light.luz_escritorio` |
| redPlc colors/icons | Own colors + Font Awesome icons (`hal-*`) |

Internal memory (`M`, `T`, `C`, `FF`, …) is **kept** for intermediate ladder bits.

## Requirements

- Node-RED ≥ 2
- [`node-red-contrib-home-assistant-websocket`](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) (already included in the official HA addon)
- HA Server node configured and **connected** (reads state from WS cache / `global.homeassistant`)

## Install

### 1 — Node-RED Manage Palette (recommended)

1. Menu → **Manage palette** → **Install**
2. Search: `node-red-contrib-ha-ladder`
3. Install → restart Node-RED if asked

Categories: **`ha-ladder`** / **`ha-ladder-sys`**.

### 2 — Copy into Home Assistant Node-RED addon

1. Put the package folder here:
   ```
   /addon_configs/<slug>_nodered/node_modules/node-red-contrib-ha-ladder
   ```
2. **Restart** the Node-RED addon

## Nodes (summary)

### System (`ha-ladder-sys`)

| Palette | Node | Role |
|---------|------|------|
| `hal-scan` | Scan inject | Scan cycle (PLC-style) |
| `hal-boot` | On start | Pulse on startup |
| `hal-1st` | First scan | First cycle |
| `hal-rail` | Rail | Left/right rail |
| `hal-M` / `hal-MA` | Memory | Boolean / analog memory |

### Ladder (`ha-ladder`)

| Palette | Node | Role |
|---------|------|------|
| `hal-in` | Contact | Input: HA entity **or** memory |
| `hal-out` | Coil | Output: HA entity **or** memory |
| `hal-fn` | Function | AND/OR/XOR/NOT/triggers… |
| `hal-cnt` | Counter | Counter |
| `hal-tmr` | Timer | Timer |
| `hal-ff` | Flipflop | SR/RS/L/T |
| `hal-mov` | Move | Copy values |
| `hal-math` | Math | Arithmetic |
| `hal-scl` | Scale | Scale |
| `hal-cmp` | Compare | Comparisons |

## Contact / Coil with Home Assistant

### Contact (`hal-in`)

- **Source `ha`**: pick **HA Server** + `entity_id`
  - “On-like” states: `on`, `home`, `open`, `unlocked`, `playing`, `true`, `1`
  - `event.*`: treats event state change as a pulse
- **Source `mem`**: ladder memory (`M`, …) like redPlc
- Operations: NO / NC / P (rising) / N (falling)

### Coil (`hal-out`)

- **Source `ha`**: calls HA services (`turn_on` / `turn_off`, or `lock`/`cover` by domain)
- **Source `mem`**: writes a memory bit
- Modes: Store, Set, Reset, etc. (from redPlc)

State reads: HA websocket client cache or `global.homeassistant`.  
Writes: `callService` on the same client. **No Supervisor hacks.**

## Minimal example

Goal: `input_boolean.…` → `light.…`

1. `hal-scan` → `hal-rail` (left)
2. `hal-in` (contact) → source **ha**, entity `input_boolean.maquina_lavar_loica_em_ciclo`
3. `hal-out` (coil) → source **ha**, entity `light.luz_escritorio`, Store mode
4. Deploy; ensure the HA Server is Connected

Typical flow: **scan → rail → contact → coil**.

## Notes / limitations

- Contact is **synchronous in the scan**: needs state already cached. If the HA server is not connected, the contact stays “mute”.
- Not a replacement for complex HA automations; digital ladder + memory, with HA as I/O.
- Visuals differ from redPlc on purpose (colors + Font Awesome) so the palette is not confusing.

## License

Apache-2.0 — see [LICENSE](./LICENSE).  
Original redPlc copyright: Derya Y. / Ocean — see commits and file headers.  
HA Ladder modifications: Ricardo Gomes, 2026.

## Links

- This repo: https://github.com/ricard0g0mes/node-red-contrib-ha-ladder
- redPlc (upstream): https://github.com/redplc/redplc
- Author: https://ricardogomes.eu · [Buy me a coffee](https://buymeacoffee.com/ricard0g0mes)

---

<a id="português"></a>

# Português

## O que muda face ao redPlc

| redPlc | HA Ladder |
|--------|-----------|
| `I` / `Q` via módulos GPIO | Entidades HA no **contact** / **coil** |
| `import` / `export` | Não necessários para I/O digital HA |
| Endereços `M0.0` como I/O externo | `entity_id` tipo `light.luz_escritorio` |
| Cores/ícones redPlc | Cores próprias + ícones Font Awesome (`hal-*`) |

Memória interna (`M`, `T`, `C`, `FF`, …) **mantém-se** para bits intermédios do ladder.

## Requisitos

- Node-RED ≥ 2
- [`node-red-contrib-home-assistant-websocket`](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) (já vem no addon oficial HA)
- Server node HA configurado e **ligado** (lê estado do cache WS / `global.homeassistant`)

## Instalação

### 1 — Manage palette no Node-RED (recomendado)

1. Menu → **Manage palette** → **Install**
2. Pesquisa: `node-red-contrib-ha-ladder`
3. Instala → reinicia o Node-RED se pedir

Categorias: **`ha-ladder`** / **`ha-ladder-sys`**.

### 2 — Cópia directa no addon Node-RED do HA

1. Coloca a pasta do pacote em:
   ```
   /addon_configs/<slug>_nodered/node_modules/node-red-contrib-ha-ladder
   ```
2. **Restart** do addon Node-RED

## Nodes (resumo)

### Sistema (`ha-ladder-sys`)

| Palette | Node | Função |
|---------|------|--------|
| `hal-scan` | Scan inject | Ciclo de scan (como PLC) |
| `hal-boot` | On start | Pulso no arranque |
| `hal-1st` | First scan | Primeiro ciclo |
| `hal-rail` | Rail | Barra esquerda/direita |
| `hal-M` / `hal-MA` | Memory | Memória booleana / analógica |

### Ladder (`ha-ladder`)

| Palette | Node | Função |
|---------|------|--------|
| `hal-in` | Contact | Entrada: entidade HA **ou** memória |
| `hal-out` | Coil | Saída: entidade HA **ou** memória |
| `hal-fn` | Function | AND/OR/XOR/NOT/triggers… |
| `hal-cnt` | Counter | Contador |
| `hal-tmr` | Timer | Temporizador |
| `hal-ff` | Flipflop | SR/RS/L/T |
| `hal-mov` | Move | Cópia de valores |
| `hal-math` | Math | Aritmética |
| `hal-scl` | Scale | Escala |
| `hal-cmp` | Compare | Comparações |

## Contact / Coil com Home Assistant

### Contact (`hal-in`)

- **Source `ha`**: escolhe o **HA Server** + `entity_id`
  - Estados “on-like”: `on`, `home`, `open`, `unlocked`, `playing`, `true`, `1`
  - `event.*`: trata mudança de estado do evento como pulso
- **Source `mem`**: memória ladder (`M`, …) como no redPlc
- Operações: NO / NC / P (rising) / N (falling)

### Coil (`hal-out`)

- **Source `ha`**: chama serviços HA (`turn_on` / `turn_off`, ou `lock`/`cover` conforme domínio)
- **Source `mem`**: escreve bit de memória
- Modos: Store, Set, Reset, etc. (herdados do redPlc)

Leitura de estado: cache do cliente websocket HA ou `global.homeassistant`.  
Escrita: `callService` do mesmo cliente. **Sem hacks ao Supervisor.**

## Exemplo mínimo

Objectivo: `input_boolean.…` → `light.…`

1. `hal-scan` → `hal-rail` (esquerda)
2. `hal-in` (contact) → source **ha**, entity `input_boolean.maquina_lavar_loica_em_ciclo`
3. `hal-out` (coil) → source **ha**, entity `light.luz_escritorio`, modo Store
4. Deploy; garante que o HA Server está Connected

Fluxo típico: **scan → rail → contact → coil**.

## Notas / limitações

- Contact é **síncrono no scan**: precisa de estado já em cache. Se o server HA não estiver ligado, o contact fica “mudo”.
- Não substitui automações HA complexas; é ladder digital + memória, com HA como I/O.
- Visual diferente do redPlc de propósito (cores + Font Awesome), para não confundir na palette.

## Licença

Apache-2.0 — ver [LICENSE](./LICENSE).  
Copyright original redPlc: Derya Y. / Ocean — ver commits e cabeçalhos nos ficheiros.  
Modificações HA Ladder: Ricardo Gomes, 2026.

## Links

- Este repo: https://github.com/ricard0g0mes/node-red-contrib-ha-ladder
- redPlc (upstream): https://github.com/redplc/redplc
- Autor: https://ricardogomes.eu · [Buy me a coffee](https://buymeacoffee.com/ricard0g0mes)
