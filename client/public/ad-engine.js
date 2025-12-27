/**
 * Sistema de Gerenciamento de Anúncios - TikJogos
 * Engine de renderização e seleção de anúncios
 * 
 * Features:
 * - Weighted Random Algorithm
 * - Device Detection (mobile/desktop)
 * - Click Tracking
 * - Anti-AdBlock naming
 * - Performance optimized
 */

(function() {
  'use strict';

  // Configuração
  const CONFIG = {
    dataUrl: '/ads-data.js',
    trackingEnabled: true,
    debugMode: false
  };

  // Classe principal do Ad Engine
  class PartnerContentEngine {
    constructor() {
      this.contentData = [];
      this.deviceType = this.detectDevice();
      this.impressions = {};
      this.clicks = {};
      
      if (CONFIG.debugMode) {
        console.log('[Partner Content] Engine initialized');
        console.log('[Partner Content] Device type:', this.deviceType);
      }
    }

    /**
     * Detecta o tipo de dispositivo
     * @returns {string} 'mobile' ou 'desktop'
     */
    detectDevice() {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      
      const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
                       window.innerWidth <= 768;
      
      return isMobile ? 'mobile' : 'desktop';
    }

    /**
     * Carrega os dados dos anúncios
     * @returns {Promise<void>}
     */
    async loadContentData() {
      return new Promise((resolve, reject) => {
        // Verificar se os dados já estão carregados globalmente
        if (window.partnerContentData) {
          this.contentData = window.partnerContentData;
          if (CONFIG.debugMode) {
            console.log('[Partner Content] Data loaded from global:', this.contentData.length, 'items');
          }
          resolve();
          return;
        }

        // Carregar via script tag
        const script = document.createElement('script');
        script.src = CONFIG.dataUrl;
        script.async = true;
        
        script.onload = () => {
          if (window.partnerContentData) {
            this.contentData = window.partnerContentData;
            if (CONFIG.debugMode) {
              console.log('[Partner Content] Data loaded via script:', this.contentData.length, 'items');
            }
            resolve();
          } else {
            reject(new Error('Content data not found'));
          }
        };
        
        script.onerror = () => reject(new Error('Failed to load content data'));
        
        document.head.appendChild(script);
      });
    }

    /**
     * Filtra anúncios por categoria (device)
     * @returns {Array} Anúncios filtrados
     */
    filterByDevice() {
      return this.contentData.filter(item => 
        item.category === 'all' || item.category === this.deviceType
      );
    }

    /**
     * Seleciona um anúncio aleatório baseado no peso (Weighted Random)
     * @param {Array} items - Array de anúncios
     * @returns {Object|null} Anúncio selecionado
     */
    selectWeightedRandom(items) {
      if (!items || items.length === 0) return null;

      // Calcular peso total
      const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
      
      // Gerar número aleatório
      let random = Math.random() * totalWeight;
      
      // Selecionar item baseado no peso
      for (const item of items) {
        random -= (item.weight || 1);
        if (random <= 0) {
          return item;
        }
      }
      
      // Fallback: retornar o último item
      return items[items.length - 1];
    }

    /**
     * Renderiza um anúncio em um slot específico
     * @param {string} slotId - ID do elemento onde renderizar
     * @param {Object} options - Opções de renderização
     */
    renderContent(slotId, options = {}) {
      const slot = document.getElementById(slotId);
      if (!slot) {
        if (CONFIG.debugMode) {
          console.warn('[Partner Content] Slot not found:', slotId);
        }
        return;
      }

      // Filtrar por dispositivo
      const filteredItems = this.filterByDevice();
      
      if (filteredItems.length === 0) {
        if (CONFIG.debugMode) {
          console.warn('[Partner Content] No items available for device:', this.deviceType);
        }
        return;
      }

      // Selecionar anúncio
      const selectedItem = this.selectWeightedRandom(filteredItems);
      
      if (!selectedItem) {
        if (CONFIG.debugMode) {
          console.warn('[Partner Content] No item selected');
        }
        return;
      }

      // Registrar impressão
      this.trackImpression(selectedItem.id, slotId);

      // Criar HTML do anúncio
      const contentHtml = this.createContentHTML(selectedItem, slotId, options);
      
      // Inserir no DOM
      slot.innerHTML = contentHtml;

      // Adicionar event listener para tracking de clique
      const link = slot.querySelector('.partner-link');
      if (link) {
        link.addEventListener('click', (e) => {
          this.trackClick(selectedItem.id, slotId, selectedItem.affiliateLink);
        });
      }

      if (CONFIG.debugMode) {
        console.log('[Partner Content] Rendered:', selectedItem.id, 'in', slotId);
      }
    }

    /**
     * Cria o HTML do anúncio
     * @param {Object} item - Dados do anúncio
     * @param {string} slotId - ID do slot
     * @param {Object} options - Opções de renderização
     * @returns {string} HTML do anúncio
     */
    createContentHTML(item, slotId, options = {}) {
      const size = options.size || 'auto';
      const showLabel = options.showLabel !== false;
      
      return `
        <div class="destaque-visual" data-content-id="${item.id}" data-slot="${slotId}">
          ${showLabel ? '<div class="visual-label">Parceiro</div>' : ''}
          <a href="${item.affiliateLink}" 
             class="partner-link" 
             target="_blank" 
             rel="noopener noreferrer sponsored"
             aria-label="${item.altText}">
            <img src="${item.imageUrl}" 
                 alt="${item.altText}" 
                 class="visual-image"
                 loading="lazy">
          </a>
        </div>
      `;
    }

    /**
     * Registra uma impressão
     * @param {string} contentId - ID do anúncio
     * @param {string} slotId - ID do slot
     */
    trackImpression(contentId, slotId) {
      if (!this.impressions[contentId]) {
        this.impressions[contentId] = 0;
      }
      this.impressions[contentId]++;

      if (CONFIG.trackingEnabled) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
          gtag('event', 'partner_impression', {
            content_id: contentId,
            slot_id: slotId,
            device_type: this.deviceType
          });
        }

        if (CONFIG.debugMode) {
          console.log('[Partner Content] Impression tracked:', contentId, 'in', slotId);
        }
      }
    }

    /**
     * Registra um clique
     * @param {string} contentId - ID do anúncio
     * @param {string} slotId - ID do slot
     * @param {string} link - Link do anúncio
     */
    trackClick(contentId, slotId, link) {
      if (!this.clicks[contentId]) {
        this.clicks[contentId] = 0;
      }
      this.clicks[contentId]++;

      if (CONFIG.trackingEnabled) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
          gtag('event', 'partner_click', {
            content_id: contentId,
            slot_id: slotId,
            device_type: this.deviceType,
            outbound_link: link
          });
        }

        // Console log para debug
        console.log('[Partner Content] Click tracked:', {
          contentId,
          slotId,
          link,
          totalClicks: this.clicks[contentId]
        });
      }
    }

    /**
     * Renderiza todos os slots na página
     */
    async renderAllSlots() {
      try {
        await this.loadContentData();

        // Definir configurações por slot
        const slots = [
          { id: 'partner-slot-sidebar', options: { size: 'medium' } },
          { id: 'partner-slot-top', options: { size: 'large' } },
          { id: 'partner-slot-middle', options: { size: 'large' } },
          { id: 'partner-slot-bottom', options: { size: 'large' } }
        ];

        // Renderizar cada slot
        slots.forEach(slot => {
          this.renderContent(slot.id, slot.options);
        });

        if (CONFIG.debugMode) {
          console.log('[Partner Content] All slots rendered');
          console.log('[Partner Content] Stats:', {
            impressions: this.impressions,
            clicks: this.clicks
          });
        }
      } catch (error) {
        console.error('[Partner Content] Error rendering slots:', error);
      }
    }

    /**
     * Obtém estatísticas de performance
     * @returns {Object} Estatísticas
     */
    getStats() {
      return {
        impressions: this.impressions,
        clicks: this.clicks,
        ctr: this.calculateCTR()
      };
    }

    /**
     * Calcula CTR (Click-Through Rate)
     * @returns {Object} CTR por anúncio
     */
    calculateCTR() {
      const ctr = {};
      
      Object.keys(this.impressions).forEach(contentId => {
        const impressions = this.impressions[contentId] || 0;
        const clicks = this.clicks[contentId] || 0;
        ctr[contentId] = impressions > 0 ? (clicks / impressions * 100).toFixed(2) + '%' : '0%';
      });
      
      return ctr;
    }
  }

  // Inicializar quando o DOM estiver pronto
  function init() {
    const engine = new PartnerContentEngine();
    
    // Renderizar todos os slots
    engine.renderAllSlots();

    // Expor globalmente para debug
    window.partnerContentEngine = engine;

    // Expor função para renderizar slots individuais
    window.renderPartnerContent = (slotId, options) => {
      engine.renderContent(slotId, options);
    };
  }

  // Aguardar DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
