(() => {
  const products = [
    {
      id: "p-100",
      name: "Trailblazer Hoodie",
      category: "apparel",
      price: 68,
      badge: "New",
      description: "Midweight hoodie with a soft interior and durable outer shell for chilly mornings.",
      tags: ["cotton", "unisex", "outdoor"],
    },
    {
      id: "p-101",
      name: "Switchback Tee",
      category: "apparel",
      price: 32,
      badge: "Top",
      description: "Breathable everyday tee designed for movement with a relaxed fit.",
      tags: ["breathable", "lightweight"],
    },
    {
      id: "p-102",
      name: "Summit Shell Jacket",
      category: "apparel",
      price: 124,
      badge: "Pro",
      description: "Weather-ready shell with sealed seams, built for wind and surprise rain.",
      tags: ["water-resistant", "technical"],
    },
    {
      id: "p-200",
      name: "RidgeLine Backpack",
      category: "gear",
      price: 148,
      badge: "Gear",
      description: "Versatile 24L pack with modular straps, laptop sleeve, and quick-access pockets.",
      tags: ["24L", "carry-on", "modular"],
    },
    {
      id: "p-201",
      name: "Fieldstone Bottle",
      category: "gear",
      price: 26,
      badge: "Eco",
      description: "Double-wall insulated bottle that keeps drinks cold for long hikes.",
      tags: ["insulated", "steel"],
    },
    {
      id: "p-202",
      name: "Altitude Camp Mug",
      category: "gear",
      price: 22,
      badge: "Camp",
      description: "Enamel-style mug with a sturdy base and wide handle for camp mornings.",
      tags: ["enamel", "classic"],
    },
    {
      id: "p-300",
      name: "Compass Keychain",
      category: "accessories",
      price: 14,
      badge: "Mini",
      description: "Pocket-sized compass charm that clips onto bags, keys, and zipper pulls.",
      tags: ["mini", "gift"],
    },
    {
      id: "p-301",
      name: "Waypoint Beanie",
      category: "accessories",
      price: 24,
      badge: "Warm",
      description: "Rib-knit beanie with a snug fit and soft stretch that keeps its shape.",
      tags: ["knit", "winter"],
    },
    {
      id: "p-302",
      name: "Signal Patch Set",
      category: "accessories",
      price: 18,
      badge: "Patch",
      description: "Set of three iron-on patches inspired by trail markers and topo lines.",
      tags: ["set", "iron-on"],
    },
  ];

  const state = {
    filter: "all",
    search: "",
    cart: new Map(),
    lastCheckoutAt: null,
  };

  const els = {
    grid: document.querySelector("#product-grid"),
    cardTemplate: document.querySelector("#product-card-template"),
    resultsMeta: document.querySelector("#results-meta"),
    filterButtons: Array.from(document.querySelectorAll(".filter-button")),
    searchInput: document.querySelector("#search-input"),
    cartButton: document.querySelector("#cart-button"),
    cartCount: document.querySelector("#cart-count"),
    cartPanel: document.querySelector("#cart-panel"),
    cartClose: document.querySelector("#cart-close"),
    cartItems: document.querySelector("#cart-items"),
    cartSubtotal: document.querySelector("#cart-subtotal"),
    checkoutButton: document.querySelector("#checkout-button"),
    checkoutMessage: document.querySelector("#checkout-message"),
    detailsDialog: document.querySelector("#details-dialog"),
    detailsTitle: document.querySelector("#details-title"),
    detailsCategory: document.querySelector("#details-category"),
    detailsPrice: document.querySelector("#details-price"),
    detailsDescription: document.querySelector("#details-description"),
    detailsTags: document.querySelector("#details-tags"),
    detailsAdd: document.querySelector("#details-add"),
  };

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  function getVisibleProducts() {
    const term = state.search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesFilter = state.filter === "all" || product.category === state.filter;
      if (!matchesFilter) return false;
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  }

  function cartQuantity() {
    let total = 0;
    for (const entry of state.cart.values()) {
      total += entry.quantity;
    }
    return total;
  }

  function cartSubtotal() {
    let subtotal = 0;
    for (const entry of state.cart.values()) {
      subtotal += entry.product.price * entry.quantity;
    }
    return subtotal;
  }

  function setActiveFilter(nextFilter) {
    state.filter = nextFilter;
    for (const button of els.filterButtons) {
      const isActive = button.dataset.filter === nextFilter;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    }
    renderProducts();
  }

  function updateResultsMeta(visibleCount) {
    const filterLabel = state.filter === "all" ? "all categories" : state.filter;
    const searchLabel = state.search ? ` for "${state.search}"` : "";
    els.resultsMeta.textContent = `${visibleCount} result${visibleCount === 1 ? "" : "s"} in ${filterLabel}${searchLabel}`;
  }

  function renderProducts() {
    const visible = getVisibleProducts();
    els.grid.innerHTML = "";
    updateResultsMeta(visible.length);

    if (visible.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.dataset.testid = "empty-state";
      empty.textContent = "No products match your search.";
      els.grid.appendChild(empty);
      return;
    }

    for (const product of visible) {
      const fragment = els.cardTemplate.content.cloneNode(true);
      const card = fragment.querySelector(".product-card");
      const badge = fragment.querySelector("[data-testid='product-badge']");
      const name = fragment.querySelector("[data-testid='product-name']");
      const category = fragment.querySelector("[data-testid='product-category']");
      const price = fragment.querySelector("[data-testid='product-price']");
      const addButton = fragment.querySelector("[data-testid='add-to-cart']");
      const detailsButton = fragment.querySelector("[data-testid='view-details']");

      card.dataset.productId = product.id;
      card.dataset.category = product.category;
      card.setAttribute("aria-label", product.name);

      badge.textContent = product.badge;
      name.textContent = product.name;
      category.textContent = product.category;
      price.textContent = fmt.format(product.price);

      addButton.addEventListener("click", () => {
        addToCart(product.id);
      });

      detailsButton.addEventListener("click", () => {
        openDetails(product.id);
      });

      els.grid.appendChild(fragment);
    }
  }

  function renderCart() {
    els.cartItems.innerHTML = "";

    if (state.cart.size === 0) {
      const empty = document.createElement("li");
      empty.className = "cart-empty";
      empty.dataset.testid = "cart-empty";
      empty.textContent = "Your cart is empty.";
      els.cartItems.appendChild(empty);
    } else {
      for (const { product, quantity } of state.cart.values()) {
        const item = document.createElement("li");
        item.className = "cart-item";
        item.dataset.testid = "cart-item";
        item.dataset.productId = product.id;

        const name = document.createElement("p");
        name.className = "cart-item-name";
        name.dataset.testid = "cart-item-name";
        name.textContent = product.name;

        const meta = document.createElement("p");
        meta.className = "cart-item-meta";
        meta.dataset.testid = "cart-item-meta";
        meta.textContent = `${fmt.format(product.price)} x ${quantity}`;

        const actions = document.createElement("div");
        actions.className = "cart-item-actions";
        actions.dataset.testid = "cart-item-actions";

        const dec = document.createElement("button");
        dec.type = "button";
        dec.dataset.testid = "cart-decrease";
        dec.textContent = "-";
        dec.addEventListener("click", () => changeQuantity(product.id, -1));

        const inc = document.createElement("button");
        inc.type = "button";
        inc.dataset.testid = "cart-increase";
        inc.textContent = "+";
        inc.addEventListener("click", () => changeQuantity(product.id, 1));

        const remove = document.createElement("button");
        remove.type = "button";
        remove.dataset.testid = "cart-remove";
        remove.className = "remove";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => removeFromCart(product.id));

        actions.append(dec, inc, remove);

        item.append(name, meta, actions);
        els.cartItems.appendChild(item);
      }
    }

    els.cartCount.textContent = String(cartQuantity());
    els.cartSubtotal.textContent = fmt.format(cartSubtotal());
  }

  function addToCart(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existing = state.cart.get(productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.set(productId, { product, quantity: 1 });
    }

    els.checkoutMessage.textContent = "";
    renderCart();
    openCart();
  }

  function changeQuantity(productId, delta) {
    const entry = state.cart.get(productId);
    if (!entry) return;

    entry.quantity += delta;
    if (entry.quantity <= 0) {
      state.cart.delete(productId);
    }

    els.checkoutMessage.textContent = "";
    renderCart();
  }

  function removeFromCart(productId) {
    state.cart.delete(productId);
    els.checkoutMessage.textContent = "";
    renderCart();
  }

  function openCart() {
    els.cartPanel.hidden = false;
    els.cartPanel.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    els.cartPanel.hidden = true;
    els.cartPanel.setAttribute("aria-hidden", "true");
  }

  function openDetails(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    els.detailsDialog.dataset.productId = product.id;
    els.detailsTitle.textContent = product.name;
    els.detailsCategory.textContent = `Category: ${product.category}`;
    els.detailsPrice.textContent = fmt.format(product.price);
    els.detailsDescription.textContent = product.description;
    els.detailsTags.innerHTML = "";

    for (const tag of product.tags) {
      const li = document.createElement("li");
      li.dataset.testid = "details-tag";
      li.textContent = tag;
      els.detailsTags.appendChild(li);
    }

    if (typeof els.detailsDialog.showModal === "function") {
      els.detailsDialog.showModal();
    } else {
      els.detailsDialog.setAttribute("open", "true");
    }
  }

  function handleDetailsAdd() {
    const productId = els.detailsDialog.dataset.productId;
    if (!productId) return;
    addToCart(productId);
    if (els.detailsDialog.open) {
      els.detailsDialog.close("added");
    }
  }

  function handleCheckout() {
    const quantity = cartQuantity();
    if (quantity === 0) {
      els.checkoutMessage.textContent = "Add at least one item to checkout.";
      return;
    }

    const subtotal = fmt.format(cartSubtotal());
    const now = new Date();
    state.lastCheckoutAt = now;
    const timeLabel = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    els.checkoutMessage.textContent = `Checked out ${quantity} item${quantity === 1 ? "" : "s"} at ${timeLabel} (${subtotal}).`;
  }

  function wireEvents() {
    els.filterButtons.forEach((button) => {
      button.addEventListener("click", () => setActiveFilter(button.dataset.filter || "all"));
    });

    els.searchInput.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderProducts();
    });

    els.cartButton.addEventListener("click", () => {
      if (els.cartPanel.hidden) openCart();
      else closeCart();
    });

    els.cartClose.addEventListener("click", closeCart);
    els.checkoutButton.addEventListener("click", handleCheckout);
    els.detailsAdd.addEventListener("click", handleDetailsAdd);

    els.detailsDialog.addEventListener("click", (event) => {
      const rect = els.detailsDialog.getBoundingClientRect();
      const clickedInDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!clickedInDialog) {
        els.detailsDialog.close("dismiss");
      }
    });
  }

  function init() {
    wireEvents();
    renderProducts();
    renderCart();
    closeCart();
  }

  init();
})();
