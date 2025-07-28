#!/bin/bash
set -e

echo "🚀 Setting up disco development environment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if running on supported OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
else
    print_warning "Unknown operating system: $OSTYPE"
    OS="unknown"
fi

print_info "Detected OS: $OS"
echo ""

# Check Node.js version
print_info "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version $NODE_VERSION detected, but version 20+ is required"
    echo "Please upgrade Node.js to version 20 or higher"
    exit 1
fi

print_status "Node.js $(node -v) is installed"

# Check npm version
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "npm $(npm -v) is installed"

# Install dependencies
print_info "Installing project dependencies..."
if [ -f "yarn.lock" ]; then
    if command -v yarn &> /dev/null; then
        print_info "Using Yarn for package management"
        yarn install --frozen-lockfile
    else
        print_warning "yarn.lock found but Yarn not installed, using npm instead"
        npm ci
    fi
elif [ -f "pnpm-lock.yaml" ]; then
    if command -v pnpm &> /dev/null; then
        print_info "Using pnpm for package management"
        pnpm install --frozen-lockfile
    else
        print_warning "pnpm-lock.yaml found but pnpm not installed, using npm instead"
        npm ci
    fi
else
    print_info "Using npm for package management"
    npm ci
fi

print_status "Dependencies installed successfully"

# Setup Railway CLI if not present
print_info "Checking Railway CLI..."
if ! command -v railway &> /dev/null; then
    print_info "Installing Railway CLI..."
    if [[ "$OS" == "windows" ]]; then
        print_warning "Please install Railway CLI manually on Windows:"
        echo "  Download from: https://railway.app/cli"
    else
        curl -fsSL https://railway.app/install.sh | sh
        print_status "Railway CLI installed"
        print_warning "Please restart your terminal or run: source ~/.bashrc"
    fi
else
    print_status "Railway CLI $(railway --version) is already installed"
fi

# Create .env file if it doesn't exist
print_info "Setting up environment variables..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "Created .env file from .env.example"
        print_warning "Please edit .env file with your actual configuration values"
    else
        print_error ".env.example file not found"
        exit 1
    fi
else
    print_status ".env file already exists"
fi

# Build the project
print_info "Building the project..."
npm run build
print_status "Project built successfully"

# Run validation checks
print_info "Running Railway configuration validation..."
npm run railway:validate
print_status "Railway configuration validation passed"

# Check if Docker is available (optional)
print_info "Checking for Docker (optional)..."
if command -v docker &> /dev/null; then
    print_status "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') is available"
else
    print_warning "Docker not found - Docker is optional but recommended for local development"
fi

# Check if git is configured
print_info "Checking Git configuration..."
if ! git config user.name &> /dev/null || ! git config user.email &> /dev/null; then
    print_warning "Git user configuration is incomplete"
    echo "Please run:"
    echo "  git config --global user.name \"Your Name\""
    echo "  git config --global user.email \"your.email@example.com\""
else
    print_status "Git is configured for $(git config user.name) <$(git config user.email)>"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Run 'npm run railway:report' to generate configuration report"
echo "  4. Visit the project documentation for more information"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev                 # Start development server"
echo "  npm run build              # Build for production"
echo "  npm run railway:validate   # Validate Railway configuration"
echo "  npm run railway:report     # Generate validation report"
echo "  npm run lint               # Run ESLint"
echo "  npm test                   # Run tests"
echo ""

# Check for specific configuration issues
print_info "Running environment validation..."
npm run railway:validate-env || true

echo ""
print_status "Setup completed successfully!"
echo "Happy coding! 🚀"