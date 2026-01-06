/**
 * Rocky Top Business Directory
 * ES6+ Vanilla JavaScript
 * 
 * Features:
 * - Live search with debounce
 * - Category & tag filtering
 * - Ownership filters (women-owned, veteran-owned, new)
 * - Contact modal with lead routing
 * - Claim listing flow (mock)
 * - Favorites toggle
 */

'use strict';

// ========================================
// State Management
// ========================================
const state = {
    filters: {
        search: '',
        category: '',
        tags: new Set(),
        ownership: new Set()
    }
};

// ========================================
// DOM References
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const elements = {
    searchInput: $('#search-input'),
    searchForm: $('.search-form'),
    filterPills: $$('.filter-pill'),
    categorySelect: $('#category-select'),
    categoryItems: $$('.category-item'),
    tagButtons: $$('.tag'),
    activeFiltersContainer: $('#active-filters'),
    clearFiltersBtn: $('#clear-filters-btn'),
    resultsCount: $('#results-count'),
    listingsGrid: $('#listings-grid'),
    businessCards: $$('.business-card'),
    noResults: $('#no-results'),
    contactModal: $('#contact-modal'),
    contactForm: $('#contact-form'),
    contactBusinessName: $('#contact-business-name'),
    contactSuccess: $('#contact-success'),
    contactBtns: $$('.contact-btn'),
    claimModal: $('#claim-modal'),
    claimBtn: $('#claim-btn'),
    claimSearch: $('#claim-search'),
    claimResults: $('#claim-results'),
    claimSteps: $$('.claim-step'),
    claimStep1: $('#claim-step-1'),
    claimStep2: $('#claim-step-2'),
    claimStep3: $('#claim-step-3'),
    claimSelectedBusiness: $('#claim-selected-business'),
    claimBack: $('#claim-back'),
    claimNext: $('#claim-next'),
    verificationOptions: $$('.verification-option'),
    favoriteButtons: $$('.card-favorite')
};

// ========================================
// Utility Functions
// ========================================

/**
 * Debounce function for search input
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Normalize text for search comparison
 */
function normalizeText(text) {
    return text.toLowerCase().trim();
}

/**
 * Announce to screen readers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.classList.add('visually-hidden');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// ========================================
// Filter Logic
// ========================================

/**
 * Apply all active filters and update display
 */
function applyFilters() {
    const { search, category, tags, ownership } = state.filters;
    let visibleCount = 0;

    elements.businessCards.forEach(card => {
        let visible = true;

        // Search filter
        if (search) {
            const cardText = normalizeText(card.textContent);
            const searchTerms = normalizeText(search).split(/\s+/);
            visible = searchTerms.every(term => cardText.includes(term));
        }

        // Category filter
        if (visible && category) {
            visible = card.dataset.category === category;
        }

        // Ownership filters (OR logic)
        if (visible && ownership.size > 0) {
            const cardTags = card.dataset.tags ? card.dataset.tags.split(',') : [];
            visible = [...ownership].some(filter => cardTags.includes(filter));
        }

        // Tag filters (AND logic)
        if (visible && tags.size > 0) {
            const cardTags = card.dataset.tags ? card.dataset.tags.split(',') : [];
            visible = [...tags].every(tag => cardTags.includes(tag));
        }

        card.style.display = visible ? '' : 'none';
        card.setAttribute('aria-hidden', !visible);
        
        if (visible) visibleCount++;
    });

    elements.resultsCount.textContent = visibleCount;
    elements.noResults.hidden = visibleCount > 0;
    elements.listingsGrid.hidden = visibleCount === 0;

    updateActiveFiltersDisplay();
    announceToScreenReader(`${visibleCount} businesses found`);
}

/**
 * Update the active filters tag display
 */
function updateActiveFiltersDisplay() {
    const { search, category, tags, ownership } = state.filters;
    const hasFilters = search || category || tags.size > 0 || ownership.size > 0;
    
    elements.activeFiltersContainer.hidden = !hasFilters;
    
    if (!hasFilters) return;

    let html = '';

    if (search) {
        html += createFilterTag('search', `Search: "${search}"`);
    }

    if (category) {
        const categoryLabel = elements.categorySelect.options[elements.categorySelect.selectedIndex].text;
        html += createFilterTag('category', categoryLabel);
    }

    ownership.forEach(filter => {
        const labels = { women: 'Women-Owned', veteran: 'Veteran-Owned', new: 'New This Month' };
        html += createFilterTag(`ownership-${filter}`, labels[filter]);
    });

    tags.forEach(tag => {
        html += createFilterTag(`tag-${tag}`, tag);
    });

    html += '<button type="button" class="clear-all-filters" id="clear-all">Clear all</button>';

    elements.activeFiltersContainer.innerHTML = html;

    // Add event listeners
    elements.activeFiltersContainer.querySelectorAll('.remove-filter').forEach(btn => {
        btn.addEventListener('click', handleRemoveFilter);
    });

    $('#clear-all')?.addEventListener('click', clearAllFilters);
}

/**
 * Create a filter tag HTML string
 */
function createFilterTag(id, label) {
    return `
        <span class="active-filter-tag">
            ${label}
            <button type="button" class="remove-filter" data-filter="${id}" aria-label="Remove ${label} filter">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </span>
    `;
}

/**
 * Handle removing a single filter
 */
function handleRemoveFilter(e) {
    const filterId = e.currentTarget.dataset.filter;

    if (filterId === 'search') {
        state.filters.search = '';
        elements.searchInput.value = '';
    } else if (filterId === 'category') {
        state.filters.category = '';
        elements.categorySelect.value = '';
        updateCategorySidebar('');
    } else if (filterId.startsWith('ownership-')) {
        const ownership = filterId.replace('ownership-', '');
        state.filters.ownership.delete(ownership);
        updateFilterPill(ownership, false);
    } else if (filterId.startsWith('tag-')) {
        const tag = filterId.replace('tag-', '');
        state.filters.tags.delete(tag);
        updateTagButton(tag, false);
    }

    applyFilters();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    state.filters.search = '';
    state.filters.category = '';
    state.filters.tags.clear();
    state.filters.ownership.clear();

    elements.searchInput.value = '';
    elements.categorySelect.value = '';
    
    elements.filterPills.forEach(pill => {
        pill.setAttribute('aria-pressed', 'false');
    });
    
    elements.categoryItems.forEach(item => {
        item.classList.toggle('active', !item.dataset.category);
    });
    
    elements.tagButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    applyFilters();
}

/**
 * Update filter pill state
 */
function updateFilterPill(filter, active) {
    const pill = $(`.filter-pill[data-filter="${filter}"]`);
    if (pill) {
        pill.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
}

/**
 * Update tag button state
 */
function updateTagButton(tag, active) {
    const btn = $(`.tag[data-tag="${tag}"]`);
    if (btn) {
        btn.classList.toggle('active', active);
    }
}

/**
 * Update category sidebar active state
 */
function updateCategorySidebar(category) {
    elements.categoryItems.forEach(item => {
        const itemCategory = item.dataset.category || '';
        item.classList.toggle('active', itemCategory === category);
    });
}

// ========================================
// Event Handlers
// ========================================

const handleSearch = debounce((e) => {
    state.filters.search = e.target.value;
    applyFilters();
}, 300);

function handleSearchSubmit(e) {
    e.preventDefault();
    state.filters.search = elements.searchInput.value;
    applyFilters();
}

function handleFilterPillClick(e) {
    const pill = e.currentTarget;
    const filter = pill.dataset.filter;
    const isPressed = pill.getAttribute('aria-pressed') === 'true';
    
    pill.setAttribute('aria-pressed', !isPressed);
    
    if (isPressed) {
        state.filters.ownership.delete(filter);
    } else {
        state.filters.ownership.add(filter);
    }
    
    applyFilters();
}

function handleCategoryChange(e) {
    state.filters.category = e.target.value;
    updateCategorySidebar(e.target.value);
    applyFilters();
}

function handleCategoryClick(e) {
    const category = e.currentTarget.dataset.category || '';
    state.filters.category = category;
    elements.categorySelect.value = category;
    updateCategorySidebar(category);
    applyFilters();
}

function handleTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    const isActive = e.currentTarget.classList.contains('active');
    
    e.currentTarget.classList.toggle('active');
    
    if (isActive) {
        state.filters.tags.delete(tag);
    } else {
        state.filters.tags.add(tag);
    }
    
    applyFilters();
}

function handleFavoriteClick(e) {
    const btn = e.currentTarget;
    const isPressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', !isPressed);
    
    const svg = btn.querySelector('svg');
    svg.style.fill = isPressed ? 'none' : 'currentColor';
    
    announceToScreenReader(isPressed ? 'Removed from favorites' : 'Added to favorites');
}

// ========================================
// Contact Modal
// ========================================

function openContactModal(businessName) {
    elements.contactBusinessName.textContent = businessName;
    elements.contactForm.reset();
    elements.contactForm.hidden = false;
    elements.contactSuccess.hidden = true;
    elements.contactModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        $('#contact-name').focus();
    }, 100);
}

function closeContactModal() {
    elements.contactModal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    // Log lead data (in production, send to backend)
    console.log('Lead submitted:', {
        business: elements.contactBusinessName.textContent,
        name: $('#contact-name').value,
        email: $('#contact-email').value,
        phone: $('#contact-phone').value,
        subject: $('#contact-subject').value,
        message: $('#contact-message').value
    });

    elements.contactForm.hidden = true;
    elements.contactSuccess.hidden = false;
}

// ========================================
// Claim Listing Modal
// ========================================

let claimCurrentStep = 1;
let claimSelectedBusiness = null;

function openClaimModal() {
    resetClaimModal();
    elements.claimModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        elements.claimSearch.focus();
    }, 100);
}

function closeClaimModal() {
    elements.claimModal.classList.remove('active');
    document.body.style.overflow = '';
}

function resetClaimModal() {
    claimCurrentStep = 1;
    claimSelectedBusiness = null;
    
    elements.claimSearch.value = '';
    elements.claimResults.innerHTML = '<p class="claim-hint">Start typing to search for your business listing.</p>';
    
    elements.claimSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    elements.claimStep1.hidden = false;
    elements.claimStep2.hidden = true;
    elements.claimStep3.hidden = true;
    
    elements.claimBack.hidden = true;
    elements.claimNext.disabled = true;
    elements.claimNext.textContent = 'Continue';
    
    elements.verificationOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.querySelector('input').checked = false;
    });
}

const handleClaimSearch = debounce((e) => {
    const query = e.target.value.trim();
    
    if (!query) {
        elements.claimResults.innerHTML = '<p class="claim-hint">Start typing to search for your business listing.</p>';
        return;
    }

    // Mock search results
    const mockResults = [
        { name: 'Ridgetop Accounting & Tax', address: 'Oak Ridge, TN', claimed: true },
        { name: 'Anderson County Roofing', address: 'Clinton, TN', claimed: false },
        { name: 'Smoky Mountain Bakehouse', address: 'Rocky Top, TN', claimed: false },
        { name: 'Valley HVAC Solutions', address: 'Norris, TN', claimed: false },
        { name: 'HC Web Labs', address: 'Anderson County, TN', claimed: false },
        { name: 'Mountain Strong Physical Therapy', address: 'Oak Ridge, TN', claimed: false }
    ].filter(b => normalizeText(b.name).includes(normalizeText(query)));

    if (mockResults.length === 0) {
        elements.claimResults.innerHTML = `
            <p class="claim-hint">
                No businesses found matching "${query}".<br>
                <a href="#" style="color: var(--color-rust);">Add your business instead →</a>
            </p>
        `;
        return;
    }

    elements.claimResults.innerHTML = mockResults.map(business => `
        <div class="claim-result ${business.claimed ? '' : ''}" data-business="${business.name}" data-claimed="${business.claimed}">
            <div>
                <div class="claim-result-name">${business.name}</div>
                <div class="claim-result-address">${business.address}</div>
            </div>
            <span class="claim-result-status ${business.claimed ? 'claim-result-status--claimed' : 'claim-result-status--available'}">
                ${business.claimed ? 'Already claimed' : 'Available'}
            </span>
        </div>
    `).join('');

    // Add click handlers
    elements.claimResults.querySelectorAll('.claim-result').forEach(result => {
        result.addEventListener('click', () => {
            const isClaimed = result.dataset.claimed === 'true';
            
            if (isClaimed) {
                announceToScreenReader('This business has already been claimed');
                return;
            }

            elements.claimResults.querySelectorAll('.claim-result').forEach(r => {
                r.classList.remove('selected');
            });
            result.classList.add('selected');
            
            claimSelectedBusiness = result.dataset.business;
            elements.claimNext.disabled = false;
        });
    });
}, 300);

function handleClaimNext() {
    if (claimCurrentStep === 1 && claimSelectedBusiness) {
        claimCurrentStep = 2;
        elements.claimSelectedBusiness.textContent = claimSelectedBusiness;
        
        elements.claimSteps[0].classList.remove('active');
        elements.claimSteps[0].classList.add('completed');
        elements.claimSteps[1].classList.add('active');
        
        elements.claimStep1.hidden = true;
        elements.claimStep2.hidden = false;
        
        elements.claimBack.hidden = false;
        elements.claimNext.disabled = true;
        
    } else if (claimCurrentStep === 2) {
        claimCurrentStep = 3;
        
        elements.claimSteps[1].classList.remove('active');
        elements.claimSteps[1].classList.add('completed');
        elements.claimSteps[2].classList.add('active');
        
        elements.claimStep2.hidden = true;
        elements.claimStep3.hidden = false;
        
        elements.claimBack.hidden = true;
        elements.claimNext.textContent = 'Done';
        
    } else if (claimCurrentStep === 3) {
        closeClaimModal();
    }
}

function handleClaimBack() {
    if (claimCurrentStep === 2) {
        claimCurrentStep = 1;
        
        elements.claimSteps[1].classList.remove('active');
        elements.claimSteps[0].classList.remove('completed');
        elements.claimSteps[0].classList.add('active');
        
        elements.claimStep2.hidden = true;
        elements.claimStep1.hidden = false;
        
        elements.claimBack.hidden = true;
        elements.claimNext.disabled = false;
    }
}

function handleVerificationSelect(e) {
    const option = e.currentTarget;
    
    elements.verificationOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.querySelector('input').checked = false;
    });
    
    option.classList.add('selected');
    option.querySelector('input').checked = true;
    elements.claimNext.disabled = false;
}

// ========================================
// Modal Utilities
// ========================================

function handleModalOverlayClick(e) {
    if (e.target === e.currentTarget) {
        if (e.currentTarget.id === 'contact-modal') {
            closeContactModal();
        } else if (e.currentTarget.id === 'claim-modal') {
            closeClaimModal();
        }
    }
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        if (elements.contactModal.classList.contains('active')) {
            closeContactModal();
        }
        if (elements.claimModal.classList.contains('active')) {
            closeClaimModal();
        }
    }
}

// ========================================
// Mobile Menu Toggle
// ========================================

function toggleMobileMenu() {
    const headerInner = document.querySelector('.header-inner');
    if (headerInner.className === 'header-inner') {
        headerInner.className += ' responsive';
    } else {
        headerInner.className = 'header-inner';
    }
}

// Make it globally available
window.toggleMobileMenu = toggleMobileMenu;

// ========================================
// Scroll to Top Button
// ========================================

const scrollTopBtn = $('#scroll-top-btn');

function handleScroll() {
    if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========================================
// Initialize
// ========================================

function init() {
    // Search
    elements.searchInput.addEventListener('input', handleSearch);
    elements.searchForm.addEventListener('submit', handleSearchSubmit);

    // Filter pills
    elements.filterPills.forEach(pill => {
        pill.addEventListener('click', handleFilterPillClick);
    });

    // Category select
    elements.categorySelect.addEventListener('change', handleCategoryChange);

    // Sidebar categories
    elements.categoryItems.forEach(item => {
        item.addEventListener('click', handleCategoryClick);
    });

    // Tags
    elements.tagButtons.forEach(btn => {
        btn.addEventListener('click', handleTagClick);
    });

    // Clear filters button
    elements.clearFiltersBtn?.addEventListener('click', clearAllFilters);

    // Favorite buttons
    elements.favoriteButtons.forEach(btn => {
        btn.addEventListener('click', handleFavoriteClick);
    });

    // Contact modal
    elements.contactBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openContactModal(btn.dataset.business);
        });
    });

    elements.contactModal.addEventListener('click', handleModalOverlayClick);
    elements.contactModal.querySelector('.modal-close').addEventListener('click', closeContactModal);
    $('#contact-cancel').addEventListener('click', closeContactModal);
    $('#contact-done').addEventListener('click', closeContactModal);
    elements.contactForm.addEventListener('submit', handleContactSubmit);

    // Claim modal
    elements.claimBtn.addEventListener('click', openClaimModal);
    elements.claimModal.addEventListener('click', handleModalOverlayClick);
    elements.claimModal.querySelector('.modal-close').addEventListener('click', closeClaimModal);
    elements.claimSearch.addEventListener('input', handleClaimSearch);
    elements.claimNext.addEventListener('click', handleClaimNext);
    elements.claimBack.addEventListener('click', handleClaimBack);
    
    elements.verificationOptions.forEach(opt => {
        opt.addEventListener('click', handleVerificationSelect);
    });

    // Global keyboard handler
    document.addEventListener('keydown', handleEscapeKey);

    // Scroll to top button
    window.addEventListener('scroll', handleScroll, { passive: true });
    scrollTopBtn.addEventListener('click', scrollToTop);

    console.log('🏔️ Rocky Top Business Directory initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
