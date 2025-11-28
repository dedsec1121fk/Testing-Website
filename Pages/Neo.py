import os
import sys
import subprocess
import time
import shutil
import urllib.request
import random

# ==========================================
# COLORS & STYLING
# ==========================================
class C:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARN = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def clear_screen():
    os.system('clear')

def print_header():
    clear_screen()
    print(f"{C.HEADER}{C.BOLD}")
    print(r"""
   _  __             _             
  / |/ /__ ___ _  __(_)_ _  
 /    / -_) _ \ |/ / /  ' \ 
/_/|_/\__/\___/___/_/_/_/_/ 
   TERMUX MASTER INSTALLER v3.0
    """)
    print(f"{C.END}")

# ==========================================
# THE CONFIGURATION
# ==========================================

LUA_CONFIG = r"""
--[[ 
   TERMUX MASTER CONFIGURATION v3.0
   The "Command Center" Edition
--]]

-- 1. CORE SETTINGS
vim.g.mapleader = " "
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.mouse = "a"
vim.opt.clipboard = "unnamedplus"
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.termguicolors = true
vim.opt.signcolumn = "yes"
vim.opt.undofile = true
vim.opt.cursorline = true -- Highlight current line

-- 2. LAZY PLUGIN MANAGER
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup({

  -- === THE DASHBOARD (ALPHA) ===
  {
    'goolord/alpha-nvim',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    config = function ()
        local dashboard = require("alpha.themes.dashboard")
        
        -- ASCII Header
        dashboard.section.header.val = {
            "    _  __             _          ",
            "   / |/ /__ ___ _  __(_)_ _      ",
            "  /    / -_) _ \\ |/ / /  ' \\     ",
            " /_/|_/\\__/\\___/___/_/_/_/_/     ",
            "                                 ",
        }

        -- Buttons
        dashboard.section.buttons.val = {
            dashboard.button("n", "📄  New File", ":ene <BAR> startinsert <CR>"),
            dashboard.button("f", "🔍  Find File", ":Telescope find_files <CR>"),
            dashboard.button("r", "🕒  Recent Files", ":Telescope oldfiles <CR>"),
            dashboard.button("s", "💾  Restore Session", ":lua require('persistence').load() <CR>"),
            dashboard.button("t", "📝  Live Grep (Search Text)", ":Telescope live_grep <CR>"),
            
            dashboard.button("c", "⚙️   Open Configuration", ":e $MYVIMRC <CR>"),
            dashboard.button("u", "⚡  Update Plugins", ":Lazy sync <CR>"),
            dashboard.button("?", "❓  Open Cheatsheet", ":Cheatsheet <CR>"),
            dashboard.button("q", "❌  Quit", ":qa<CR>"),
        }

        -- Footer (Stats)
        dashboard.section.footer.val = function()
            return "Plugins: " .. require("lazy").stats().count .. "  |  v3.0 Config"
        end

        dashboard.section.header.opts.hl = "Type"
        dashboard.section.buttons.opts.hl = "Keyword"
        dashboard.section.footer.opts.hl = "Constant"

        require("alpha").setup(dashboard.config)
    end
  },

  -- === SESSION MANAGER (Auto-Save open windows) ===
  {
    "folke/persistence.nvim",
    event = "BufReadPre",
    opts = { options = { "buffers", "curdir", "tabpages", "winsize" } },
  },

  -- === UI ELEMENTS ===
  {
    "folke/which-key.nvim",
    event = "VeryLazy",
    init = function() vim.o.timeout = true; vim.o.timeoutlen = 300 end,
    opts = {}
  },
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    config = function() vim.cmd([[colorscheme tokyonight-night]]) end,
  },
  {
    "nvim-lualine/lualine.nvim",
    opts = { options = { theme = "tokyonight" } }
  },
  { "lukas-reineke/indent-blankline.nvim", main = "ibl", opts = {} },

  -- === FILE EXPLORER ===
  {
    "nvim-tree/nvim-tree.lua",
    cmd = "NvimTreeToggle",
    keys = { { "<leader>e", "<cmd>NvimTreeToggle<cr>", desc = "Explorer" } },
    opts = {
      disable_netrw = true,
      view = { width = 30 },
    },
  },

  -- === FINDER (Telescope) ===
  {
    "nvim-telescope/telescope.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    keys = {
      { "<leader>ff", "<cmd>Telescope find_files<cr>", desc = "Find File" },
      { "<leader>fg", "<cmd>Telescope live_grep<cr>", desc = "Find Text" },
    },
  },

  -- === TERMINAL & GIT ===
  {
    'akinsho/toggleterm.nvim',
    version = "*",
    config = true,
    keys = { { "<C-\\>", "<cmd>ToggleTerm<cr>", desc = "Toggle Terminal" } }
  },
  {
    "kdheepak/lazygit.nvim",
    keys = { { "<leader>gg", "<cmd>LazyGit<cr>", desc = "Open Git" } }
  },

  -- === CODING INTELLIGENCE ===
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function() 
      require("nvim-treesitter.configs").setup({
        ensure_installed = { "c", "lua", "vim", "python", "javascript", "html", "css", "bash", "markdown" },
        auto_install = true,
        highlight = { enable = true },
      })
    end
  },
  {
    "hrsh7th/nvim-cmp",
    dependencies = {
      "hrsh7th/cmp-nvim-lsp", "hrsh7th/cmp-buffer", "hrsh7th/cmp-path", 
      "L3MON4D3/LuaSnip", "saadparwaiz1/cmp_luasnip", "rafamadriz/friendly-snippets",
    },
    config = function()
      local cmp = require("cmp")
      local luasnip = require("luasnip")
      require("luasnip.loaders.from_vscode").lazy_load()
      cmp.setup({
        snippet = { expand = function(args) luasnip.lsp_expand(args.body) end },
        mapping = cmp.mapping.preset.insert({
          ["<C-b>"] = cmp.mapping.scroll_docs(-4),
          ["<C-f>"] = cmp.mapping.scroll_docs(4),
          ["<C-Space>"] = cmp.mapping.complete(),
          ["<CR>"] = cmp.mapping.confirm({ select = true }),
          ["<Tab>"] = cmp.mapping.select_next_item(),
        }),
        sources = cmp.config.sources({
          { name = "nvim_lsp" }, { name = "luasnip" }, { name = "path" },
        }, { { name = "buffer" } }),
      })
    end,
  },
  {
    "neovim/nvim-lspconfig",
    config = function()
      local lspconfig = require("lspconfig")
      local capabilities = require("cmp_nvim_lsp").default_capabilities()
      local servers = { "pylsp", "clangd", "ts_ls", "lua_ls", "html", "cssls", "bashls" }
      for _, lsp in ipairs(servers) do lspconfig[lsp].setup({ capabilities = capabilities }) end
    end,
  },
  { "windwp/nvim-autopairs", opts = {} },
  { "numToStr/Comment.nvim", opts = {} },
})

-- === CUSTOM COMMANDS ===
vim.api.nvim_create_user_command("Cheatsheet", function()
    local buf = vim.api.nvim_create_buf(false, true)
    vim.api.nvim_set_current_buf(buf)
    local lines = {
        "  NEOVIM QUICK REFERENCE",
        "  ======================",
        "  [ DASHBOARD KEYS ]",
        "  n : New File",
        "  f : Find File",
        "  s : Restore Last Session",
        "  c : Open Settings",
        "  u : Update Plugins",
        "",
        "  [ EDITING ]",
        "  i     : Insert Mode (Type)",
        "  ESC   : Normal Mode (Command)",
        "  :w    : Save",
        "  :q    : Quit",
        "  u     : Undo",
        "  Ctrl+r: Redo",
        "",
        "  [ TOOLS ]",
        "  Space+e   : File Explorer",
        "  Space+g+g : Git Manager",
        "  Ctrl+\\    : Terminal",
        "  g+c+c     : Comment Line",
        "",
        "  Press 'q' to close this help.",
    }
    vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
    vim.keymap.set('n', 'q', ':q<CR>', { buffer = buf, silent = true })
end, {})
"""

TERMUX_PROPS = r"""
extra-keys = [ \
 ['ESC','|', '/', 'HOME', 'UP', 'END', 'PGUP', 'DEL'], \
 ['TAB','CTRL', 'ALT', 'LEFT', 'DOWN', 'RIGHT', 'PGDN', 'BKSP'], \
 ['<', '>', '{', '}', '(', ')', '[', ']', '"', ';'] \
]
extra-keys-style = default
"""

# ==========================================
# INSTALLER LOGIC
# ==========================================

def run_cmd(cmd, desc, fatal=False):
    print(f"{C.CYAN}>> {desc}...{C.END}")
    try:
        subprocess.check_call(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"{C.GREEN} [OK] {desc}{C.END}")
        return True
    except subprocess.CalledProcessError:
        print(f"{C.FAIL} [ERROR] {desc} failed.{C.END}")
        if fatal: sys.exit(1)
        return False

def install_font():
    print(f"\n{C.HEADER}=== INSTALLING NERD FONT ==={C.END}")
    termux_home = os.path.expanduser("~/.termux")
    font_path = os.path.join(termux_home, "font.ttf")
    
    if not os.path.exists(termux_home): os.makedirs(termux_home)
    
    url = "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/JetBrainsMono.zip"
    zip_path = "font.zip"
    
    print(f"{C.CYAN}>> Downloading font (approx 20MB)...{C.END}")
    try:
        urllib.request.urlretrieve(url, zip_path)
        run_cmd(f"unzip -o {zip_path} 'JetBrainsMonoNerdFont-Regular.ttf' -d {termux_home}", "Extracting Font")
        os.rename(os.path.join(termux_home, "JetBrainsMonoNerdFont-Regular.ttf"), font_path)
        os.remove(zip_path)
        run_cmd("termux-reload-settings", "Reloading Termux UI")
        print(f"{C.GREEN} [OK] Font Installed.{C.END}")
    except Exception as e:
        print(f"{C.WARN} Font failed: {e}. Icons might be broken.{C.END}")

def install_software():
    print(f"\n{C.HEADER}=== INSTALLING PACKAGES ==={C.END}")
    print(f"{C.WARN}Keep screen on. This downloads about 200MB.{C.END}")
    
    run_cmd("pkg update -y", "Updating Repositories", fatal=True)
    run_cmd(f"pkg install neovim git ripgrep build-essential python nodejs clang lazygit unzip wget -y", "Installing Core Packages", fatal=True)
    
    run_cmd("pip install python-lsp-server", "Installing Python LSP")
    run_cmd("npm install -g typescript typescript-language-server vscode-langservers-extracted bash-language-server", "Installing JS/HTML/CSS LSPs")

def deploy_config():
    print(f"\n{C.HEADER}=== DEPLOYING CONFIG ==={C.END}")
    config_dir = os.path.expanduser("~/.config/nvim")
    
    if os.path.exists(config_dir):
        backup = f"{config_dir}_bak_{int(time.time())}"
        shutil.move(config_dir, backup)
        print(f"{C.WARN} Old config moved to {backup}{C.END}")
    
    os.makedirs(config_dir)
    
    with open(os.path.join(config_dir, "init.lua"), "w") as f:
        f.write(LUA_CONFIG)
    
    termux_props = os.path.expanduser("~/.termux/termux.properties")
    with open(termux_props, "w") as f:
        f.write(TERMUX_PROPS)
        
    run_cmd("termux-reload-settings", "Applying Settings")

def main():
    print_header()
    print(" 1. Install Everything (Recommended)")
    print(" 2. Just Update Config (Keep packages)")
    print(" 3. Exit")
    
    opt = input(f"\n{C.CYAN}Select Option > {C.END}")
    
    if opt == '1':
        install_software()
        install_font()
        deploy_config()
    elif opt == '2':
        deploy_config()
    else:
        sys.exit()

    print(f"\n{C.GREEN}COMPLETE.{C.END} Restart Termux and type {C.BOLD}nvim{C.END}")

if __name__ == "__main__":
    main()