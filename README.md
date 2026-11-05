# node-red-contrib-ha-ladder

Ladder logic (estilo IEC 61131-3) para **Node-RED**, com **entidades do Home Assistant** como entradas/saídas digitais.

Palette: **`ha-ladder`** / **`ha-ladder-sys`**.

---

## Attribution / Based on redPlc

Este pacote é um **fork/adaptação** do trabalho excelente do **redPlc**:

- Pacote original: [`@redplc/node-red-redplc`](https://www.npmjs.com/package/@redplc/node-red-redplc)
- Repositório: **https://github.com/redplc/redplc**
- Licença: **Apache-2.0** (mantida neste fork)

A maior parte da lógica de ladder (scan, rail, contact/coil modes, function, counter, timer, flipflop, move, math, scale, compare, memória `M`/`MA`) vem do redPlc.  
Este fork altera sobretudo o **I/O**: em vez de GPIO/`I`/`Q`, o contact/coil falam com **entidades HA**.

Se usas ladder no Node-RED, apoia também o projecto original: [redplc/redplc](https://github.com/redplc/redplc).

---

## Author

**Ricardo Gomes**  
Website: https://ricardogomes.eu  
If this saved you time/pain: https://buymeacoffee.com/ricard0g0mes

---

## O que muda face ao redPlc

| redPlc | HA Ladder |
|--------|-----------|
| `I` / `Q` via módulos GPIO | Entidades HA no **contact** / **coil** |
| `import` / `export` | Não necessários para I/O digital HA |
| Endereços `M0.0` como I/O externo | `entity_id` tipo `light.luz_escritorio` |
| Cores/ícones redPlc | Cores próprias + ícones Font Awesome (`hal-*`) |

Memória interna (`M`, `T`, `C`, `FF`, …) **mantém-se** para bits intermédios do ladder.

---

## Requisitos

- Node-RED ≥ 2
- [`node-red-contrib-home-assistant-websocket`](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) (já vem no addon oficial HA)
- Server node HA configurado e **ligado** (lê estado do cache WS / `global.homeassistant`)

---

## Instalação

### Opção A — Home Assistant Node-RED addon

1. Copia a pasta do pacote para:
   ```
   /addon_configs/<slug>_nodered/node_modules/node-red-contrib-ha-ladder
   ```
   (ou o path `node_modules` do teu addon)
2. **Restart** do addon Node-RED
3. Na palette: categorias **`ha-ladder`** e **`ha-ladder-sys`**

### Opção B — npm (quando publicado)

```bash
cd ~/.node-red
npm install node-red-contrib-ha-ladder
```

Reinicia o Node-RED.

### Opção C — a partir deste repo

```bash
git clone https://github.com/ricard0g0mes/node-red-contrib-ha-ladder.git
cd ~/.node-red
npm install /caminho/para/node-red-contrib-ha-ladder
```

---

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

---

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

---

## Exemplo mínimo

Objectivo: `input_boolean.…` → `light.…`

1. `hal-scan` → `hal-rail` (esquerda)
2. `hal-in` (contact) → source **ha**, entity `input_boolean.maquina_lavar_loica_em_ciclo`
3. `hal-out` (coil) → source **ha**, entity `light.luz_escritorio`, modo Store
4. Deploy; garante que o HA Server está Connected

Fluxo típico: **scan → rail → contact → coil**.

---

## Notas / limitações

- Contact é **síncrono no scan**: precisa de estado já em cache. Se o server HA não estiver ligado, o contact fica “mudo”.
- Não substitui automações HA complexas; é ladder digital + memória, com HA como I/O.
- Visual diferente do redPlc de propósito (cores + Font Awesome), para não confundir na palette.

---

## Licença

Apache-2.0 — ver [LICENSE](./LICENSE).  
Copyright original redPlc: Derya Y. / Ocean — ver commits e cabeçalhos nos ficheiros.  
Modificações HA Ladder: Ricardo Gomes, 2026.

---

## Links

- Este repo: https://github.com/ricard0g0mes/node-red-contrib-ha-ladder
- redPlc (upstream): https://github.com/redplc/redplc
- Autor: https://ricardogomes.eu · [Buy me a coffee](https://buymeacoffee.com/ricard0g0mes)
