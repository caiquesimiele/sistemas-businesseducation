/**
 * ========================================
 * SELETOR DDI PROFISSIONAL - JavaScript
 * Sistema modular para seleção de código de país
 * Versão: 1.0.0
 * ========================================
 */

// Base de dados completa de países com códigos DDI
const COUNTRIES_DATA = [
    // América do Sul
    { name: 'Brasil', code: '+55', flag: 'https://flagsapi.com/BR/flat/32.png', iso: 'BR', priority: 1 },
    { name: 'Argentina', code: '+54', flag: 'https://flagsapi.com/AR/flat/32.png', iso: 'AR', priority: 2 },
    { name: 'Chile', code: '+56', flag: 'https://flagsapi.com/CL/flat/32.png', iso: 'CL', priority: 3 },
    { name: 'Colômbia', code: '+57', flag: 'https://flagsapi.com/CO/flat/32.png', iso: 'CO', priority: 4 },
    { name: 'Peru', code: '+51', flag: 'https://flagsapi.com/PE/flat/32.png', iso: 'PE', priority: 5 },
    { name: 'Uruguai', code: '+598', flag: 'https://flagsapi.com/UY/flat/32.png', iso: 'UY' },
    { name: 'Paraguai', code: '+595', flag: 'https://flagsapi.com/PY/flat/32.png', iso: 'PY' },
    { name: 'Bolívia', code: '+591', flag: 'https://flagsapi.com/BO/flat/32.png', iso: 'BO' },
    { name: 'Venezuela', code: '+58', flag: 'https://flagsapi.com/VE/flat/32.png', iso: 'VE' },
    { name: 'Equador', code: '+593', flag: 'https://flagsapi.com/EC/flat/32.png', iso: 'EC' },
    { name: 'Guiana', code: '+592', flag: 'https://flagsapi.com/GY/flat/32.png', iso: 'GY' },
    { name: 'Suriname', code: '+597', flag: 'https://flagsapi.com/SR/flat/32.png', iso: 'SR' },
    { name: 'Guiana Francesa', code: '+594', flag: 'https://flagsapi.com/GF/flat/32.png', iso: 'GF' },
    
    // América do Norte
    { name: 'Estados Unidos', code: '+1', flag: 'https://flagsapi.com/US/flat/32.png', iso: 'US', priority: 6 },
    { name: 'Canadá', code: '+1', flag: 'https://flagsapi.com/CA/flat/32.png', iso: 'CA', priority: 7 },
    { name: 'México', code: '+52', flag: 'https://flagsapi.com/MX/flat/32.png', iso: 'MX', priority: 8 },
    
    // Europa Ocidental
    { name: 'Reino Unido', code: '+44', flag: 'https://flagsapi.com/GB/flat/32.png', iso: 'GB', priority: 9 },
    { name: 'França', code: '+33', flag: 'https://flagsapi.com/FR/flat/32.png', iso: 'FR', priority: 10 },
    { name: 'Alemanha', code: '+49', flag: 'https://flagsapi.com/DE/flat/32.png', iso: 'DE', priority: 11 },
    { name: 'Espanha', code: '+34', flag: 'https://flagsapi.com/ES/flat/32.png', iso: 'ES', priority: 12 },
    { name: 'Itália', code: '+39', flag: 'https://flagsapi.com/IT/flat/32.png', iso: 'IT', priority: 13 },
    { name: 'Portugal', code: '+351', flag: 'https://flagsapi.com/PT/flat/32.png', iso: 'PT', priority: 14 },
    { name: 'Holanda', code: '+31', flag: 'https://flagsapi.com/NL/flat/32.png', iso: 'NL' },
    { name: 'Bélgica', code: '+32', flag: 'https://flagsapi.com/BE/flat/32.png', iso: 'BE' },
    { name: 'Suíça', code: '+41', flag: 'https://flagsapi.com/CH/flat/32.png', iso: 'CH' },
    { name: 'Áustria', code: '+43', flag: 'https://flagsapi.com/AT/flat/32.png', iso: 'AT' },
    { name: 'Luxemburgo', code: '+352', flag: 'https://flagsapi.com/LU/flat/32.png', iso: 'LU' },
    { name: 'Irlanda', code: '+353', flag: 'https://flagsapi.com/IE/flat/32.png', iso: 'IE' },
    
    // Europa Nórdica
    { name: 'Suécia', code: '+46', flag: 'https://flagsapi.com/SE/flat/32.png', iso: 'SE' },
    { name: 'Noruega', code: '+47', flag: 'https://flagsapi.com/NO/flat/32.png', iso: 'NO' },
    { name: 'Dinamarca', code: '+45', flag: 'https://flagsapi.com/DK/flat/32.png', iso: 'DK' },
    { name: 'Finlândia', code: '+358', flag: 'https://flagsapi.com/FI/flat/32.png', iso: 'FI' },
    { name: 'Islândia', code: '+354', flag: 'https://flagsapi.com/IS/flat/32.png', iso: 'IS' },
    
    // Europa Oriental
    { name: 'Rússia', code: '+7', flag: 'https://flagsapi.com/RU/flat/32.png', iso: 'RU' },
    { name: 'Ucrânia', code: '+380', flag: 'https://flagsapi.com/UA/flat/32.png', iso: 'UA' },
    { name: 'Polônia', code: '+48', flag: 'https://flagsapi.com/PL/flat/32.png', iso: 'PL' },
    { name: 'República Tcheca', code: '+420', flag: 'https://flagsapi.com/CZ/flat/32.png', iso: 'CZ' },
    { name: 'Hungria', code: '+36', flag: 'https://flagsapi.com/HU/flat/32.png', iso: 'HU' },
    { name: 'Romênia', code: '+40', flag: 'https://flagsapi.com/RO/flat/32.png', iso: 'RO' },
    { name: 'Bulgária', code: '+359', flag: 'https://flagsapi.com/BG/flat/32.png', iso: 'BG' },
    { name: 'Croácia', code: '+385', flag: 'https://flagsapi.com/HR/flat/32.png', iso: 'HR' },
    { name: 'Sérvia', code: '+381', flag: 'https://flagsapi.com/RS/flat/32.png', iso: 'RS' },
    { name: 'Eslovênia', code: '+386', flag: 'https://flagsapi.com/SI/flat/32.png', iso: 'SI' },
    { name: 'Eslováquia', code: '+421', flag: 'https://flagsapi.com/SK/flat/32.png', iso: 'SK' },
    { name: 'Bósnia e Herzegovina', code: '+387', flag: 'https://flagsapi.com/BA/flat/32.png', iso: 'BA' },
    { name: 'Montenegro', code: '+382', flag: 'https://flagsapi.com/ME/flat/32.png', iso: 'ME' },
    { name: 'Kosovo', code: '+383', flag: 'https://flagsapi.com/XK/flat/32.png', iso: 'XK' },
    { name: 'Macedônia do Norte', code: '+389', flag: 'https://flagsapi.com/MK/flat/32.png', iso: 'MK' },
    { name: 'Albânia', code: '+355', flag: 'https://flagsapi.com/AL/flat/32.png', iso: 'AL' },
    { name: 'Lituânia', code: '+370', flag: 'https://flagsapi.com/LT/flat/32.png', iso: 'LT' },
    { name: 'Letônia', code: '+371', flag: 'https://flagsapi.com/LV/flat/32.png', iso: 'LV' },
    { name: 'Estônia', code: '+372', flag: 'https://flagsapi.com/EE/flat/32.png', iso: 'EE' },
    { name: 'Belarus', code: '+375', flag: 'https://flagsapi.com/BY/flat/32.png', iso: 'BY' },
    { name: 'Moldávia', code: '+373', flag: 'https://flagsapi.com/MD/flat/32.png', iso: 'MD' },
    
    // Mediterrâneo
    { name: 'Grécia', code: '+30', flag: 'https://flagsapi.com/GR/flat/32.png', iso: 'GR' },
    { name: 'Turquia', code: '+90', flag: 'https://flagsapi.com/TR/flat/32.png', iso: 'TR' },
    { name: 'Chipre', code: '+357', flag: 'https://flagsapi.com/CY/flat/32.png', iso: 'CY' },
    { name: 'Malta', code: '+356', flag: 'https://flagsapi.com/MT/flat/32.png', iso: 'MT' },
    
    // Ásia Oriental
    { name: 'Japão', code: '+81', flag: 'https://flagsapi.com/JP/flat/32.png', iso: 'JP', priority: 15 },
    { name: 'China', code: '+86', flag: 'https://flagsapi.com/CN/flat/32.png', iso: 'CN', priority: 16 },
    { name: 'Coreia do Sul', code: '+82', flag: 'https://flagsapi.com/KR/flat/32.png', iso: 'KR', priority: 17 },
    { name: 'Taiwan', code: '+886', flag: 'https://flagsapi.com/TW/flat/32.png', iso: 'TW' },
    { name: 'Hong Kong', code: '+852', flag: 'https://flagsapi.com/HK/flat/32.png', iso: 'HK' },
    { name: 'Macau', code: '+853', flag: 'https://flagsapi.com/MO/flat/32.png', iso: 'MO' },
    { name: 'Coreia do Norte', code: '+850', flag: 'https://flagsapi.com/KP/flat/32.png', iso: 'KP' },
    { name: 'Mongólia', code: '+976', flag: 'https://flagsapi.com/MN/flat/32.png', iso: 'MN' },
    
    // Sudeste Asiático
    { name: 'Singapura', code: '+65', flag: 'https://flagsapi.com/SG/flat/32.png', iso: 'SG' },
    { name: 'Malásia', code: '+60', flag: 'https://flagsapi.com/MY/flat/32.png', iso: 'MY' },
    { name: 'Tailândia', code: '+66', flag: 'https://flagsapi.com/TH/flat/32.png', iso: 'TH' },
    { name: 'Vietnã', code: '+84', flag: 'https://flagsapi.com/VN/flat/32.png', iso: 'VN' },
    { name: 'Filipinas', code: '+63', flag: 'https://flagsapi.com/PH/flat/32.png', iso: 'PH' },
    { name: 'Indonésia', code: '+62', flag: 'https://flagsapi.com/ID/flat/32.png', iso: 'ID' },
    { name: 'Brunei', code: '+673', flag: 'https://flagsapi.com/BN/flat/32.png', iso: 'BN' },
    { name: 'Camboja', code: '+855', flag: 'https://flagsapi.com/KH/flat/32.png', iso: 'KH' },
    { name: 'Laos', code: '+856', flag: 'https://flagsapi.com/LA/flat/32.png', iso: 'LA' },
    { name: 'Myanmar', code: '+95', flag: 'https://flagsapi.com/MM/flat/32.png', iso: 'MM' },
    { name: 'Timor-Leste', code: '+670', flag: 'https://flagsapi.com/TL/flat/32.png', iso: 'TL' },
    
    // Ásia Sul
    { name: 'Índia', code: '+91', flag: 'https://flagsapi.com/IN/flat/32.png', iso: 'IN', priority: 18 },
    { name: 'Paquistão', code: '+92', flag: 'https://flagsapi.com/PK/flat/32.png', iso: 'PK' },
    { name: 'Bangladesh', code: '+880', flag: 'https://flagsapi.com/BD/flat/32.png', iso: 'BD' },
    { name: 'Sri Lanka', code: '+94', flag: 'https://flagsapi.com/LK/flat/32.png', iso: 'LK' },
    { name: 'Nepal', code: '+977', flag: 'https://flagsapi.com/NP/flat/32.png', iso: 'NP' },
    { name: 'Butão', code: '+975', flag: 'https://flagsapi.com/BT/flat/32.png', iso: 'BT' },
    { name: 'Maldivas', code: '+960', flag: 'https://flagsapi.com/MV/flat/32.png', iso: 'MV' },
    { name: 'Afeganistão', code: '+93', flag: 'https://flagsapi.com/AF/flat/32.png', iso: 'AF' },
    
    // Oceania
    { name: 'Austrália', code: '+61', flag: 'https://flagsapi.com/AU/flat/32.png', iso: 'AU', priority: 19 },
    { name: 'Nova Zelândia', code: '+64', flag: 'https://flagsapi.com/NZ/flat/32.png', iso: 'NZ', priority: 20 },
    { name: 'Fiji', code: '+679', flag: 'https://flagsapi.com/FJ/flat/32.png', iso: 'FJ' },
    { name: 'Papua Nova Guiné', code: '+675', flag: 'https://flagsapi.com/PG/flat/32.png', iso: 'PG' },
    { name: 'Samoa', code: '+685', flag: 'https://flagsapi.com/WS/flat/32.png', iso: 'WS' },
    { name: 'Tonga', code: '+676', flag: 'https://flagsapi.com/TO/flat/32.png', iso: 'TO' },
    { name: 'Vanuatu', code: '+678', flag: 'https://flagsapi.com/VU/flat/32.png', iso: 'VU' },
    
    // África
    { name: 'África do Sul', code: '+27', flag: 'https://flagsapi.com/ZA/flat/32.png', iso: 'ZA' },
    { name: 'Egito', code: '+20', flag: 'https://flagsapi.com/EG/flat/32.png', iso: 'EG' },
    { name: 'Nigéria', code: '+234', flag: 'https://flagsapi.com/NG/flat/32.png', iso: 'NG' },
    { name: 'Quênia', code: '+254', flag: 'https://flagsapi.com/KE/flat/32.png', iso: 'KE' },
    { name: 'Marrocos', code: '+212', flag: 'https://flagsapi.com/MA/flat/32.png', iso: 'MA' },
    { name: 'Argélia', code: '+213', flag: 'https://flagsapi.com/DZ/flat/32.png', iso: 'DZ' },
    { name: 'Tunísia', code: '+216', flag: 'https://flagsapi.com/TN/flat/32.png', iso: 'TN' },
    { name: 'Líbia', code: '+218', flag: 'https://flagsapi.com/LY/flat/32.png', iso: 'LY' },
    { name: 'Gana', code: '+233', flag: 'https://flagsapi.com/GH/flat/32.png', iso: 'GH' },
    { name: 'Costa do Marfim', code: '+225', flag: 'https://flagsapi.com/CI/flat/32.png', iso: 'CI' },
    { name: 'Senegal', code: '+221', flag: 'https://flagsapi.com/SN/flat/32.png', iso: 'SN' },
    { name: 'Etiópia', code: '+251', flag: 'https://flagsapi.com/ET/flat/32.png', iso: 'ET' },
    { name: 'Tanzânia', code: '+255', flag: 'https://flagsapi.com/TZ/flat/32.png', iso: 'TZ' },
    { name: 'Uganda', code: '+256', flag: 'https://flagsapi.com/UG/flat/32.png', iso: 'UG' },
    { name: 'Moçambique', code: '+258', flag: 'https://flagsapi.com/MZ/flat/32.png', iso: 'MZ' },
    { name: 'Madagascar', code: '+261', flag: 'https://flagsapi.com/MG/flat/32.png', iso: 'MG' },
    { name: 'Angola', code: '+244', flag: 'https://flagsapi.com/AO/flat/32.png', iso: 'AO' },
    { name: 'Zâmbia', code: '+260', flag: 'https://flagsapi.com/ZM/flat/32.png', iso: 'ZM' },
    { name: 'Zimbabwe', code: '+263', flag: 'https://flagsapi.com/ZW/flat/32.png', iso: 'ZW' },
    { name: 'Botsuana', code: '+267', flag: 'https://flagsapi.com/BW/flat/32.png', iso: 'BW' },
    { name: 'Namíbia', code: '+264', flag: 'https://flagsapi.com/NA/flat/32.png', iso: 'NA' },
    
    // Oriente Médio
    { name: 'Israel', code: '+972', flag: 'https://flagsapi.com/IL/flat/32.png', iso: 'IL' },
    { name: 'Arábia Saudita', code: '+966', flag: 'https://flagsapi.com/SA/flat/32.png', iso: 'SA' },
    { name: 'Emirados Árabes Unidos', code: '+971', flag: 'https://flagsapi.com/AE/flat/32.png', iso: 'AE' },
    { name: 'Qatar', code: '+974', flag: 'https://flagsapi.com/QA/flat/32.png', iso: 'QA' },
    { name: 'Kuwait', code: '+965', flag: 'https://flagsapi.com/KW/flat/32.png', iso: 'KW' },
    { name: 'Bahrein', code: '+973', flag: 'https://flagsapi.com/BH/flat/32.png', iso: 'BH' },
    { name: 'Omã', code: '+968', flag: 'https://flagsapi.com/OM/flat/32.png', iso: 'OM' },
    { name: 'Jordânia', code: '+962', flag: 'https://flagsapi.com/JO/flat/32.png', iso: 'JO' },
    { name: 'Líbano', code: '+961', flag: 'https://flagsapi.com/LB/flat/32.png', iso: 'LB' },
    { name: 'Síria', code: '+963', flag: 'https://flagsapi.com/SY/flat/32.png', iso: 'SY' },
    { name: 'Iraque', code: '+964', flag: 'https://flagsapi.com/IQ/flat/32.png', iso: 'IQ' },
    { name: 'Irã', code: '+98', flag: 'https://flagsapi.com/IR/flat/32.png', iso: 'IR' },
    { name: 'Cazaquistão', code: '+7', flag: 'https://flagsapi.com/KZ/flat/32.png', iso: 'KZ' },
    { name: 'Uzbequistão', code: '+998', flag: 'https://flagsapi.com/UZ/flat/32.png', iso: 'UZ' },
    { name: 'Turcomenistão', code: '+993', flag: 'https://flagsapi.com/TM/flat/32.png', iso: 'TM' },
    { name: 'Tadjiquistão', code: '+992', flag: 'https://flagsapi.com/TJ/flat/32.png', iso: 'TJ' },
    { name: 'Quirguistão', code: '+996', flag: 'https://flagsapi.com/KG/flat/32.png', iso: 'KG' }
].sort((a, b) => {
    // Ordenar por prioridade primeiro, depois por nome
    if (a.priority && b.priority) return a.priority - b.priority;
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return a.name.localeCompare(b.name, 'pt-BR');
});

/**
 * Classe principal do seletor DDI
 */
class PhoneDDISelector {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            throw new Error(`Container with ID "${containerId}" not found`);
        }

        // Opções padrão
        this.options = {
            defaultCountry: 'BR',
            allowSearch: true,
            placeholder: null,
            onCountryChange: null,
            onPhoneChange: null,
            onValidationChange: null,
            validateOnType: true,
            formatOnType: true,
            enableValidationIcons: false,
            customCountries: null,
            ...options
        };

        // Estados
        this.currentCountry = null;
        this.isOpen = false;
        this.isValid = false;
        this.countriesData = this.options.customCountries || COUNTRIES_DATA;
        
        this.init();
    }

    /**
     * Inicializar o componente
     */
    init() {
        this.render();
        this.initElements();
        this.bindEvents();
        this.setDefaultCountry();
        
        // Disparar evento de inicialização
        this.dispatchEvent('ddi:initialized', {
            country: this.currentCountry,
            formattedNumber: this.getFormattedNumber()
        });
    }

    /**
     * Renderizar HTML do componente
     */
    render() {
        this.container.innerHTML = `
            <div class="country-selector" data-selector="country" style="background: #f8fafc !important; border-right-color: #ccc !important; border-radius: 8px 0 0 8px !important;">
                <span class="country-flag" data-flag></span>
                <span class="country-code" data-code style="color: #121F4B !important;"></span>
                <span class="dropdown-arrow" style="color: #666 !important;">▼</span>
            </div>
            <input 
                type="tel" 
                class="phone-number-input" 
                data-input
                placeholder="${this.options.placeholder || ''}"
                maxlength="20"
                autocomplete="tel"
                style="color: #333 !important; background: transparent !important; border: none !important; outline: none !important; border-radius: 0 8px 8px 0 !important;"
            >
            <div class="countries-dropdown" data-dropdown style="background: white !important; border: 1px solid #ccc !important; border-top: none !important; border-radius: 0 0 8px 8px !important; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;">
                ${this.options.allowSearch ? `
                    <div class="search-container" style="background: #f8f9fa !important; border-bottom: 1px solid #ccc !important;">
                        <input 
                            type="text" 
                            class="search-input" 
                            data-search
                            placeholder="Buscar país ou código..."
                            style="background: white !important; border-color: #ccc !important; color: #333 !important;"
                        >
                    </div>
                ` : ''}
                <div class="countries-list" data-list>
                    ${this.renderCountriesList()}
                </div>
            </div>
        `;
    }

    /**
     * Renderizar lista de países
     */
    renderCountriesList() {
        return this.countriesData.map(country => {
            let flagDisplay;
            if (country.flag.startsWith('http')) {
                const flagEmoji = this.getEmojiFlag(country.iso);
                flagDisplay = `<img src="${country.flag}" alt="${country.name}" class="flag-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                              <span class="flag-emoji-fallback" style="display:none;">${flagEmoji}</span>`;
            } else {
                flagDisplay = country.flag;
            }
            
            return `
                <div class="country-option" data-country='${JSON.stringify(country)}' style="border-bottom-color: #f0f0f0 !important; color: #333 !important;">
                    <span class="country-flag">${flagDisplay}</span>
                    <div class="country-info">
                        <span class="country-name" style="color: #333 !important;">${country.name}</span>
                        <span class="country-code-full" style="color: #666 !important;">${country.code}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Inicializar elementos DOM
     */
    initElements() {
        this.countrySelector = this.container.querySelector('[data-selector="country"]');
        this.flagElement = this.container.querySelector('[data-flag]');
        this.codeElement = this.container.querySelector('[data-code]');
        this.phoneInput = this.container.querySelector('[data-input]');
        this.dropdown = this.container.querySelector('[data-dropdown]');
        this.searchInput = this.container.querySelector('[data-search]');
        this.countriesList = this.container.querySelector('[data-list]');
    }

    /**
     * Vincular eventos
     */
    bindEvents() {
        // Toggle dropdown
        this.countrySelector.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Busca de países
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.filterCountries(e.target.value);
            });

            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeDropdown();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.focusFirstCountry();
                }
            });
        }

        // Seleção de país
        this.countriesList.addEventListener('click', (e) => {
            const option = e.target.closest('.country-option');
            if (option) {
                const country = JSON.parse(option.dataset.country);
                this.selectCountry(country);
            }
        });

        // Navegação por teclado na lista
        this.countriesList.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const country = JSON.parse(e.target.dataset.country);
                this.selectCountry(country);
            } else if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });

        // Input do telefone
        this.phoneInput.addEventListener('input', () => {
            if (this.options.formatOnType) {
                this.formatPhoneDisplay();
            }
            if (this.options.validateOnType) {
                this.validatePhone();
            }
            this.handlePhoneChange();
        });

        this.phoneInput.addEventListener('keydown', (e) => {
            // Permitir apenas números e caracteres especiais de formatação
            const allowedKeys = [
                'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
            ];
            
            if (allowedKeys.includes(e.key) || 
                (e.key >= '0' && e.key <= '9') ||
                e.ctrlKey || e.metaKey) {
                return;
            }
            
            e.preventDefault();
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Tecla Escape global
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDropdown();
            }
        });
    }

    /**
     * Abrir/fechar dropdown
     */
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    /**
     * Abrir dropdown
     */
    openDropdown() {
        this.isOpen = true;
        this.dropdown.classList.add('show');
        this.countrySelector.classList.add('open');
        this.container.classList.add('dropdown-open');
        
        if (this.searchInput) {
            this.searchInput.focus();
            this.searchInput.value = '';
            this.filterCountries('');
        }
        
        this.dispatchEvent('ddi:dropdown:opened');
    }

    /**
     * Fechar dropdown
     */
    closeDropdown() {
        this.isOpen = false;
        this.dropdown.classList.remove('show');
        this.countrySelector.classList.remove('open');
        this.container.classList.remove('dropdown-open');
        
        this.dispatchEvent('ddi:dropdown:closed');
    }

    /**
     * Focar primeiro país visível
     */
    focusFirstCountry() {
        const firstVisibleOption = this.countriesList.querySelector('.country-option:not([style*="none"])');
        if (firstVisibleOption) {
            firstVisibleOption.focus();
        }
    }

    /**
     * Filtrar países por termo de busca
     */
    filterCountries(searchTerm) {
        const options = this.countriesList.querySelectorAll('.country-option');
        let hasResults = false;
        
        searchTerm = searchTerm.toLowerCase().trim();
        
        options.forEach(option => {
            const country = JSON.parse(option.dataset.country);
            const searchText = `${country.name} ${country.code} ${country.iso}`.toLowerCase();
            const matches = searchText.includes(searchTerm);
            
            option.style.display = matches ? 'flex' : 'none';
            if (matches) hasResults = true;
        });

        this.showNoResults(!hasResults && searchTerm);
    }

    /**
     * Mostrar/esconder mensagem de "sem resultados"
     */
    showNoResults(show) {
        let noResultsMsg = this.countriesList.querySelector('.no-results');
        
        if (show) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results';
                noResultsMsg.textContent = 'Nenhum país encontrado';
                this.countriesList.appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }

    /**
     * Selecionar país
     */
    selectCountry(country, avoidFocus = false) {
        const previousCountry = this.currentCountry;
        this.currentCountry = country;
        
        this.updateDisplay();
        this.closeDropdown();
        this.updateSelection();
        
        // Se mudou de país, reformatar o número existente
        if (previousCountry && previousCountry.iso !== country.iso && this.phoneInput.value.trim()) {
            if (this.options.formatOnType) {
                this.formatPhoneDisplay();
            }
        }
        
        // CORREÇÃO: Só foca se não for durante inicialização
        if (!avoidFocus) {
            this.phoneInput.focus();
        }
        
        if (this.options.validateOnType) {
            this.validatePhone();
        }
        
        // Callback
        if (this.options.onCountryChange) {
            this.options.onCountryChange(country, previousCountry);
        }
        
        this.dispatchEvent('ddi:country:changed', {
            country,
            previousCountry,
            formattedNumber: this.getFormattedNumber()
        });
    }

    /**
     * Definir país padrão
     */
    setDefaultCountry() {
        const defaultCountry = this.countriesData.find(c => 
            c.iso === this.options.defaultCountry
        ) || this.countriesData[0];
        
        // CORREÇÃO: Evita foco automático durante inicialização
        this.selectCountry(defaultCountry, true);
    }

    /**
     * Atualizar display do país selecionado
     */
    updateDisplay() {
        if (!this.currentCountry) return;
        
        // Renderizar bandeira com fallback para emoji
        if (this.currentCountry.flag.startsWith('http')) {
            const flagEmoji = this.getEmojiFlag(this.currentCountry.iso);
            this.flagElement.innerHTML = `<img src="${this.currentCountry.flag}" alt="${this.currentCountry.name}" class="flag-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                          <span class="flag-emoji-fallback" style="display:none;">${flagEmoji}</span>`;
        } else {
            this.flagElement.textContent = this.currentCountry.flag;
        }
        this.codeElement.textContent = this.currentCountry.code;
        this.updatePlaceholder();
    }

    /**
     * Atualizar seleção visual na lista
     */
    updateSelection() {
        // Remover seleção anterior
        this.countriesList.querySelectorAll('.country-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Adicionar seleção atual
        const currentOption = this.countriesList.querySelector(
            `[data-country*='"iso":"${this.currentCountry.iso}"']`
        );
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }

    /**
     * Atualizar placeholder baseado no país
     */
    updatePlaceholder() {
        if (this.options.placeholder) return;
        
        const placeholders = {
            'BR': '(11) 99999-9999',
            'US': '(555) 123-4567',
            'AR': '(11) 1234-5678',
            'FR': '06 12 34 56 78',
            'DE': '0151 12345678',
            'GB': '07700 900123',
            'ES': '612 34 56 78',
            'IT': '312 345 6789',
            'PT': '912 345 678',
            'MX': '55 1234 5678',
            'JP': '090-1234-5678',
            'CN': '138 0013 8000',
            'IN': '98765 43210',
            'AU': '0412 345 678'
        };
        
        this.phoneInput.placeholder = placeholders[this.currentCountry.iso] || '123456789';
    }

    /**
     * Formatar exibição do telefone
     */
    formatPhoneDisplay() {
        const currentValue = this.phoneInput.value;
        const cursorPosition = this.phoneInput.selectionStart;
        let digits = currentValue.replace(/\D/g, '');
        let formattedValue = '';
        
        // Formatação por país
        switch (this.currentCountry.iso) {
            case 'BR':
                formattedValue = this.formatBrazilianPhone(digits);
                break;
            case 'US':
            case 'CA':
                formattedValue = this.formatNorthAmericanPhone(digits);
                break;
            case 'FR':
                formattedValue = this.formatFrenchPhone(digits);
                break;
            case 'DE':
                formattedValue = this.formatGermanPhone(digits);
                break;
            case 'GB':
                formattedValue = this.formatBritishPhone(digits);
                break;
            case 'ES':
                formattedValue = this.formatSpanishPhone(digits);
                break;
            case 'IT':
                formattedValue = this.formatItalianPhone(digits);
                break;
            case 'PT':
                formattedValue = this.formatPortuguesePhone(digits);
                break;
            case 'MX':
                formattedValue = this.formatMexicanPhone(digits);
                break;
            case 'AR':
                formattedValue = this.formatArgentinePhone(digits);
                break;
            case 'AU':
                formattedValue = this.formatAustralianPhone(digits);
                break;
            case 'JP':
                formattedValue = this.formatJapanesePhone(digits);
                break;
            case 'CN':
                formattedValue = this.formatChinesePhone(digits);
                break;
            case 'IN':
                formattedValue = this.formatIndianPhone(digits);
                break;
            case 'RU':
            case 'KZ':
                formattedValue = this.formatRussianPhone(digits);
                break;
            default:
                // Formatação básica segura para outros países
                formattedValue = this.formatGenericPhone(digits);
        }
        
        // Aplicar apenas se houve mudança para evitar loops
        if (currentValue !== formattedValue) {
            this.phoneInput.value = formattedValue;
            
            // Calcular nova posição do cursor de forma mais inteligente
            let newCursorPosition = cursorPosition;
            
            // Se o valor formatado é maior, ajustar cursor para direita
            if (formattedValue.length > currentValue.length) {
                newCursorPosition = Math.min(cursorPosition + (formattedValue.length - currentValue.length), formattedValue.length);
            }
            
            // Garantir que cursor não passe do fim
            newCursorPosition = Math.min(newCursorPosition, formattedValue.length);
            
            // Aplicar nova posição
            setTimeout(() => {
                this.phoneInput.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }
    }

    /**
     * Formatar telefone brasileiro
     */
    formatBrazilianPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 11 dígitos máximo
        digits = digits.substring(0, 11);
        
        if (digits.length <= 2) {
            return `(${digits}`;
        }
        
        if (digits.length <= 6) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        }
        
        if (digits.length <= 10) {
            // Telefone fixo: (XX) XXXX-XXXX
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }
        
        // Celular: (XX) XXXXX-XXXX  
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    /**
     * Formatar telefone norte-americano (US/CA)
     */
    formatNorthAmericanPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 10 dígitos máximo (padrão US/CA)
        digits = digits.substring(0, 10);
        
        if (digits.length <= 3) {
            return `(${digits}`;
        }
        
        if (digits.length <= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        
        // Formato final: (XXX) XXX-XXXX
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    /**
     * Formatar telefone francês
     */
    formatFrenchPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 10 dígitos máximo (padrão França)
        digits = digits.substring(0, 10);
        
        // Formato francês: XX XX XX XX XX
        let formatted = '';
        for (let i = 0; i < digits.length; i++) {
            if (i > 0 && i % 2 === 0) {
                formatted += ' ';
            }
            formatted += digits[i];
        }
        
        return formatted;
    }

    /**
     * Formatar telefone alemão
     */
    formatGermanPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 12 dígitos máximo (padrão Alemanha)
        digits = digits.substring(0, 12);
        
        if (digits.length <= 4) {
            return digits;
        }
        
        if (digits.length <= 7) {
            return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        }
        
        // Formato alemão padrão: XXXX XXX XXXX
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }

    /**
     * Formatar telefone britânico
     */
    formatBritishPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 11 dígitos máximo (padrão Reino Unido)
        digits = digits.substring(0, 11);
        
        if (digits.length <= 5) {
            return digits;
        }
        
        if (digits.length <= 8) {
            return `${digits.slice(0, 5)} ${digits.slice(5)}`;
        }
        
        // Formato britânico: XXXXX XXX XXX
        return `${digits.slice(0, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }

    /**
     * Formatação genérica segura para países sem formatação específica
     */
    formatGenericPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 15 dígitos máximo (padrão internacional)
        digits = digits.substring(0, 15);
        
        if (digits.length <= 3) {
            return digits;
        }
        
        if (digits.length <= 6) {
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        
        if (digits.length <= 10) {
            return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        }
        
        // Formato genérico: XXX XXX XXX XXXX
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }

    /**
     * Formatar telefone espanhol
     */
    formatSpanishPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 9 dígitos máximo (padrão Espanha)
        digits = digits.substring(0, 9);
        
        if (digits.length <= 3) {
            return digits;
        }
        
        if (digits.length <= 6) {
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        
        // Formato espanhol: XXX XX XX XX
        return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
    }

    /**
     * Formatar telefone italiano
     */
    formatItalianPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 10 dígitos máximo (padrão Itália)
        digits = digits.substring(0, 10);
        
        if (digits.length <= 3) {
            return digits;
        }
        
        if (digits.length <= 6) {
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        
        // Formato italiano: XXX XXX XXXX
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }

    /**
     * Formatar telefone português
     */
    formatPortuguesePhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 9 dígitos máximo (padrão Portugal)
        digits = digits.substring(0, 9);
        
        if (digits.length <= 3) {
            return digits;
        }
        
        if (digits.length <= 6) {
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        
        // Formato português: XXX XXX XXX
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }

    /**
     * Formatar telefone mexicano
     */
    formatMexicanPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 10 dígitos máximo (padrão México)
        digits = digits.substring(0, 10);
        
        if (digits.length <= 3) {
            return `(${digits}`;
        }
        
        if (digits.length <= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        
        // Formato mexicano: (XXX) XXX-XXXX
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    /**
     * Formatar telefone argentino
     */
    formatArgentinePhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 10 dígitos máximo (padrão Argentina)
        digits = digits.substring(0, 10);
        
        if (digits.length <= 2) {
            return `(${digits}`;
        }
        
        if (digits.length <= 6) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        }
        
        // Formato argentino: (XX) XXXX-XXXX
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    /**
     * Formatar telefone australiano
     */
    formatAustralianPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 10 dígitos máximo (padrão Austrália)
        digits = digits.substring(0, 10);
        
        if (digits.length <= 4) {
            return digits;
        }
        
        if (digits.length <= 7) {
            return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        }
        
        // Formato australiano: XXXX XXX XXX
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }

    /**
     * Formatar telefone japonês
     */
    formatJapanesePhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 11 dígitos máximo (padrão Japão)
        digits = digits.substring(0, 11);
        
        if (digits.length <= 3) {
            return digits;
        }
        
        if (digits.length <= 7) {
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        
        // Formato japonês: XXX-XXXX-XXXX
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }

    /**
     * Formatar telefone chinês
     */
    formatChinesePhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 11 dígitos máximo (padrão China)
        digits = digits.substring(0, 11);
        
        if (digits.length <= 3) {
            return digits;
        }
        
        if (digits.length <= 7) {
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        
        // Formato chinês: XXX XXXX XXXX
        return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    }

    /**
     * Formatar telefone indiano
     */
    formatIndianPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 10 dígitos máximo (padrão Índia)
        digits = digits.substring(0, 10);
        
        if (digits.length <= 5) {
            return digits;
        }
        
        if (digits.length <= 8) {
            return `${digits.slice(0, 5)} ${digits.slice(5)}`;
        }
        
        // Formato indiano: XXXXX XXXXX
        return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }

    /**
     * Formatar telefone russo/cazaque
     */
    formatRussianPhone(digits) {
        if (digits.length === 0) return '';
        
        // Limitar a 10 dígitos máximo (padrão Rússia/Cazaquistão)
        digits = digits.substring(0, 10);
        
        if (digits.length <= 3) {
            return `(${digits}`;
        }
        
        if (digits.length <= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        
        // Formato russo: (XXX) XXX-XX-XX
        if (digits.length <= 8) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
        
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
    }

    /**
     * Obter emoji de bandeira como fallback
     */
    getEmojiFlag(isoCode) {
        const emojiFlags = {
            'BR': '🇧🇷', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'UY': '🇺🇾', 'PY': '🇵🇾', 
            'BO': '🇧🇴', 'VE': '🇻🇪', 'EC': '🇪🇨', 'GY': '🇬🇾', 'SR': '🇸🇷', 'GF': '🇬🇫', 
            'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 
            'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪', 'ES': '🇪🇸', 'IT': '🇮🇹', 'PT': '🇵🇹', 'NL': '🇳🇱', 
            'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'LU': '🇱🇺', 'IE': '🇮🇪', 
            'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'IS': '🇮🇸', 
            'RU': '🇷🇺', 'UA': '🇺🇦', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴', 'BG': '🇧🇬', 
            'HR': '🇭🇷', 'RS': '🇷🇸', 'SI': '🇸🇮', 'SK': '🇸🇰', 'BA': '🇧🇦', 'ME': '🇲🇪', 'XK': '🇽🇰', 
            'MK': '🇲🇰', 'AL': '🇦🇱', 'LT': '🇱🇹', 'LV': '🇱🇻', 'EE': '🇪🇪', 'BY': '🇧🇾', 'MD': '🇲🇩', 
            'GR': '🇬🇷', 'TR': '🇹🇷', 'CY': '🇨🇾', 'MT': '🇲🇹', 
            'JP': '🇯🇵', 'CN': '🇨🇳', 'KR': '🇰🇷', 'TW': '🇹🇼', 'HK': '🇭🇰', 'MO': '🇲🇴', 'KP': '🇰🇵', 'MN': '🇲🇳', 
            'SG': '🇸🇬', 'MY': '🇲🇾', 'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'BN': '🇧🇳', 
            'KH': '🇰🇭', 'LA': '🇱🇦', 'MM': '🇲🇲', 'TL': '🇹🇱', 
            'IN': '🇮🇳', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰', 'NP': '🇳🇵', 'BT': '🇧🇹', 'MV': '🇲🇻', 'AF': '🇦🇫', 
            'AU': '🇦🇺', 'NZ': '🇳🇿', 'FJ': '🇫🇯', 'PG': '🇵🇬', 'WS': '🇼🇸', 'TO': '🇹🇴', 'VU': '🇻🇺', 
            'ZA': '🇿🇦', 'EG': '🇪🇬', 'NG': '🇳🇬', 'KE': '🇰🇪', 'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳', 
            'LY': '🇱🇾', 'GH': '🇬🇭', 'CI': '🇨🇮', 'SN': '🇸🇳', 'ET': '🇪🇹', 'TZ': '🇹🇿', 'UG': '🇺🇬', 
            'MZ': '🇲🇿', 'MG': '🇲🇬', 'AO': '🇦🇴', 'ZM': '🇿🇲', 'ZW': '🇿🇼', 'BW': '🇧🇼', 'NA': '🇳🇦', 
            'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'QA': '🇶🇦', 'KW': '🇰🇼', 'BH': '🇧🇭', 'OM': '🇴🇲', 
            'JO': '🇯🇴', 'LB': '🇱🇧', 'SY': '🇸🇾', 'IQ': '🇮🇶', 'IR': '🇮🇷', 'KZ': '🇰🇿', 'UZ': '🇺🇿',
            'TM': '🇹🇲', 'TJ': '🇹🇯', 'KG': '🇰🇬'
        };
        return emojiFlags[isoCode] || '🏳️';
    }

    /**
     * Validar número de telefone
     */
    validatePhone() {
        const rawNumber = this.phoneInput.value.replace(/\D/g, '');
        const minLengths = {
            'BR': 10,
            'US': 10,
            'CA': 10,
            'FR': 10,
            'DE': 10,
            'GB': 10,
            'AR': 8,
            'CL': 8,
            'MX': 10,
            'JP': 10,
            'CN': 11,
            'IN': 10,
            'AU': 9
        };
        
        const minLength = minLengths[this.currentCountry.iso] || 8;
        const isValid = rawNumber.length >= minLength;
        
        this.setValidationState(isValid);
        
        // Callback
        if (this.options.onValidationChange) {
            this.options.onValidationChange(isValid, rawNumber, this.getFormattedNumber());
        }
        
        return isValid;
    }

    /**
     * Definir estado de validação
     */
    setValidationState(isValid) {
        this.isValid = isValid;
        
        // Remove classes antigas (mantém compatibilidade)
        this.container.classList.remove('error', 'success');
        
        // Remove classes do sistema unificado para aplicar nova
        this.container.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
        
        // TAMBÉM remove das classes do input interno para total sincronização
        this.phoneInput.classList.remove('campo-valido', 'campo-invalido', 'campo-neutro');
        
        // Aplica classes do sistema unificado baseado no estado
        const phoneValue = this.phoneInput.value.trim();
        if (!phoneValue) {
            // Campo vazio - neutro
            this.container.classList.add('campo-neutro');
        } else if (isValid) {
            // Campo válido - azul Google
            this.container.classList.add('campo-valido');
            this.container.classList.add('success'); // Mantém compatibilidade
        } else {
            // Campo inválido - vermelho suave
            this.container.classList.add('campo-invalido');
            this.container.classList.add('error'); // Mantém compatibilidade
        }
        
        // Força repaint para garantir aplicação do CSS
        this.container.offsetHeight;
        
        this.dispatchEvent('ddi:validation:changed', {
            isValid,
            formattedNumber: this.getFormattedNumber(),
            feedbackState: !phoneValue ? 'neutral' : (isValid ? 'valid' : 'invalid')
        });
    }

    /**
     * Manipular mudança no telefone
     */
    handlePhoneChange() {
        if (this.options.onPhoneChange) {
            this.options.onPhoneChange(
                this.phoneInput.value,
                this.getFormattedNumber(),
                this.isValid
            );
        }
        
        this.dispatchEvent('ddi:phone:changed', {
            displayValue: this.phoneInput.value,
            formattedNumber: this.getFormattedNumber(),
            isValid: this.isValid
        });
    }

    /**
     * Disparar evento customizado
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                ...detail,
                selector: this,
                containerId: this.containerId
            },
            bubbles: true
        });
        
        this.container.dispatchEvent(event);
    }

    // ========================================
    // MÉTODOS PÚBLICOS DA API
    // ========================================

    /**
     * Obter número formatado para envio (+5519981835592)
     */
    getFormattedNumber() {
        const rawNumber = this.phoneInput.value.replace(/\D/g, '');
        return rawNumber ? `${this.currentCountry.code}${rawNumber}` : '';
    }

    /**
     * Obter apenas os dígitos do telefone
     */
    getRawNumber() {
        return this.phoneInput.value.replace(/\D/g, '');
    }

    /**
     * Obter país selecionado
     */
    getSelectedCountry() {
        return this.currentCountry;
    }

    /**
     * Definir país por código ISO
     */
    setCountryByISO(isoCode) {
        const country = this.countriesData.find(c => c.iso === isoCode);
        if (country) {
            this.selectCountry(country);
            return true;
        }
        return false;
    }

    /**
     * Definir país por código DDI
     */
    setCountryByCode(countryCode) {
        const country = this.countriesData.find(c => c.code === countryCode);
        if (country) {
            this.selectCountry(country);
            return true;
        }
        return false;
    }

    /**
     * Definir número completo (+5519981835592)
     */
    setFullNumber(fullNumber) {
        if (!fullNumber || !fullNumber.startsWith('+')) {
            return false;
        }

        // Encontrar país pelo código
        const sortedCountries = [...this.countriesData].sort((a, b) => 
            b.code.length - a.code.length
        );
        
        for (const country of sortedCountries) {
            if (fullNumber.startsWith(country.code)) {
                const phoneNumber = fullNumber.substring(country.code.length);
                this.selectCountry(country, true);
                this.phoneInput.value = phoneNumber;
                if (this.options.formatOnType) {
                    this.formatPhoneDisplay();
                }
                if (this.options.validateOnType) {
                    this.validatePhone();
                }
                this.handlePhoneChange();
                return true;
            }
        }
        
        return false;
    }

    /**
     * Definir apenas o número (sem código do país)
     */
    setPhoneNumber(phoneNumber) {
        this.phoneInput.value = phoneNumber.replace(/\D/g, '');
        if (this.options.formatOnType) {
            this.formatPhoneDisplay();
        }
        if (this.options.validateOnType) {
            this.validatePhone();
        }
        this.handlePhoneChange();
    }

    /**
     * Limpar número
     */
    clear() {
        this.phoneInput.value = '';
        // Limpar aplica estado neutro - container e input
        this.container.classList.remove('error', 'success', 'campo-valido', 'campo-invalido');
        this.container.classList.add('campo-neutro');
        this.phoneInput.classList.remove('campo-valido', 'campo-invalido');
        this.phoneInput.classList.add('campo-neutro');
        this.isValid = false;
        
        // Força repaint
        this.container.offsetHeight;
        
        this.handlePhoneChange();
        
        this.dispatchEvent('ddi:validation:changed', {
            isValid: false,
            formattedNumber: '',
            feedbackState: 'neutral'
        });
    }

    /**
     * Forçar reformatação do número atual
     */
    reformat() {
        if (this.phoneInput.value.trim() && this.options.formatOnType) {
            this.formatPhoneDisplay();
        }
        if (this.options.validateOnType) {
            this.validatePhone();
        }
        this.handlePhoneChange();
    }

    /**
     * Verificar se é válido
     */
    isValid() {
        return this.validatePhone();
    }

    /**
     * Focar no input
     */
    focus() {
        this.phoneInput.focus();
    }

    /**
     * Habilitar/desabilitar
     */
    setEnabled(enabled) {
        this.phoneInput.disabled = !enabled;
        this.countrySelector.style.pointerEvents = enabled ? 'auto' : 'none';
        this.container.classList.toggle('disabled', !enabled);
    }

    /**
     * Destruir instância
     */
    destroy() {
        // Remover event listeners
        this.container.innerHTML = '';
        
        // Disparar evento de destruição
        this.dispatchEvent('ddi:destroyed');
    }
}

// ========================================
// FUNÇÃO DE INICIALIZAÇÃO AUTOMÁTICA
// ========================================

/**
 * Inicializar automaticamente seletores encontrados na página
 * DESATIVADO - Inicialização deve ser manual via script.js para evitar duplicações
 */
function initPhoneDDISelectors() {
    console.log('[PhoneDDI] Inicialização automática desativada - use inicialização manual');
    // Comentado para evitar duplicação de campos
    /*
    document.querySelectorAll('.phone-input-container').forEach(container => {
        if (!container.dataset.ddiInitialized) {
            const selector = new PhoneDDISelector(container.id || `phone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
            container.dataset.ddiInitialized = 'true';
            container._ddiSelector = selector;
        }
    });
    */
}

// DESATIVADO - Inicialização automática removida para evitar duplicação
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initPhoneDDISelectors);
// } else {
//     initPhoneDDISelectors();
// }

// Exportar para uso global
window.PhoneDDISelector = PhoneDDISelector;
window.COUNTRIES_DATA = COUNTRIES_DATA;
window.initPhoneDDISelectors = initPhoneDDISelectors;
