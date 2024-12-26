 // ============= State Management =============
 let currentAction = 'SUPPLY';
 let currentToken = null;
 let isSecondaryMode = false;
 let lastKnownBalances = {}; 
 
 // ============= Modal Configuration =============
 const ACTIONS = {
     SUPPLY: {
         primary: 'Supply',
         secondary: 'Withdraw',
         balanceLabel: 'Wallet Balance',
         statsTitle: 'SUPPLY STATS',
         limitTitle: 'COLLATERAL',
         color: 'accent',
         stats: [
             { label: 'Supply APY', key: 'supplyApy' },
             { label: 'Supply Balance', key: 'supplyBalance' },
             { label: 'Collateral Factor', key: 'collateralFactor' },
             { label: 'Used as Collateral', key: 'usedAsCollateral' }
         ]
     },
     BORROW: {
         primary: 'Borrow',
         secondary: 'Repay',
         balanceLabel: 'Borrow Limit',
         statsTitle: 'BORROW STATS',
         limitTitle: 'BORROW LIMIT',
         color: 'primary',
         stats: [
             { label: 'Borrow APY', key: 'borrowApy' },
             { label: 'Borrow Balance', key: 'borrowBalance' },
             { label: 'Your Borrow Limit', key: 'borrowLimit' },
             { label: 'Borrow Limit Used', key: 'borrowLimitUsed' }
         ]
     }
 };
 
 function updateTabStyles() {
     const primaryTab = document.getElementById('primaryTab');
     const secondaryTab = document.getElementById('secondaryTab');
     const config = ACTIONS[currentAction];
     
 
     primaryTab.className = 'flex-1 cursor-pointer text-center py-2';
     secondaryTab.className = 'flex-1 cursor-pointer text-center py-2';
     
     if (!isSecondaryMode) {
         primaryTab.classList.add('text-accent', 'border-b-2', 'border-accent');
         secondaryTab.classList.add('text-gray-400', 'hover:text-white');
     } else {
         secondaryTab.classList.add('text-accent', 'border-b-2', 'border-accent');
         primaryTab.classList.add('text-gray-400', 'hover:text-white');
     }
 }
 
 
 
 
 
    // ============= SLIDER =============
    function initializeSlider() {
     const track = document.querySelector('#percentageSlider .slider-track');
     const fill = document.querySelector('#percentageSlider .slider-fill');
     const thumb = document.querySelector('#percentageSlider .slider-thumb');
     const buttons = document.querySelectorAll('#percentageSlider .percentage-button');
     const input = document.querySelector('input[type="number"]');
     
     if (!track || !fill || !thumb || !buttons.length) return;
     
     let isDragging = false;
     
     function updateSlider(percentage) {
 
     fill.style.width = `${percentage}%`;
     thumb.style.left = `${percentage}%`;
     
     const balance = parseFloat(currentToken.balance || 0);
     input.value = (balance * (percentage / 100)).toFixed(6);
     
 
     buttons.forEach(btn => {
         const btnValue = parseInt(btn.dataset.value);
         btn.classList.toggle('active', btnValue === percentage);
     });
 }
     
 
     buttons.forEach(button => {
         button.addEventListener('click', () => {
             const percentage = parseInt(button.dataset.value);
             updateSlider(percentage);
         });
     });
     
 
     function handleMove(e) {
         if (!isDragging) return;
         
         const rect = track.getBoundingClientRect();
         let percentage = ((e.clientX - rect.left) / rect.width) * 100;
         percentage = Math.min(Math.max(percentage, 0), 100);
         percentage = Math.round(percentage / 25) * 25; 
         
         updateSlider(percentage);
     }
     
     thumb.addEventListener('mousedown', () => {
         isDragging = true;
         document.addEventListener('mousemove', handleMove);
         document.addEventListener('mouseup', () => {
             isDragging = false;
             document.removeEventListener('mousemove', handleMove);
         }, { once: true });
     });
     
 
     track.addEventListener('click', (e) => {
         const rect = track.getBoundingClientRect();
         let percentage = ((e.clientX - rect.left) / rect.width) * 100;
         percentage = Math.min(Math.max(percentage, 0), 100);
         percentage = Math.round(percentage / 25) * 25; 
         
         updateSlider(percentage);
     });
     
 
     updateSlider(0);
 }
 
 
     
     // ============= CONFIGURATION =============
     const MEMECOINS = [
     {
         symbol: 'BONK',
         id: 'bonk'
     },
     { 
         symbol: 'PNUT', 
         id: 'peanut-the-squirrel'
     },
     {
         symbol: 'POPCAT',
         id: 'popcat'
     },
     {
         symbol: 'MYRO',
         id: 'myro'
     },
     { 
         symbol: 'LUCE', 
         id: 'offcial-mascot-of-the-holy-year'
     },
     {
         symbol: 'ZEREBRO',
         id: 'zerebro'
     },
     {
         symbol: 'GOAT',
         id: 'goatseus-maximus'
     },
     {
         symbol: '$WIF',
         id: 'dogwifcoin'
     },
     {
         symbol: 'CHILL',
         id: 'chill-guy'
     },    
     {
         symbol: 'PENGU',
         id: 'pudgy-penguins'
     }
 ];
 
     const API_CONFIG = {
         coingecko: {
             headers: {
                 'x-cg-pro-api-key': 'CG-refGRrqtMhtdXNXobzrvQLzS'
             },
             baseUrl: 'https://pro-api.coingecko.com/api/v3'
         }
     };
     
     // Cache implementation
     const CACHE_KEY = 'token_data_cache';
     const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
     
     function getFromCache(coinId) {
         try {
             const cacheData = localStorage.getItem(CACHE_KEY);
             if (!cacheData) return null;
     
             const cache = JSON.parse(cacheData);
             const coinData = cache[coinId];
             
             if (!coinData) return null;
     
             if (Date.now() - coinData.timestamp > CACHE_DURATION) {
                 return null;
             }
     
             return coinData.data;
         } catch (error) {
             console.error('Cache read error:', error);
             return null;
         }
     }
     
     function saveToCache(coinId, data) {
         try {
             let cache = {};
             const existingCache = localStorage.getItem(CACHE_KEY);
             
             if (existingCache) {
                 cache = JSON.parse(existingCache);
             }
     
             cache[coinId] = {
                 data: data,
                 timestamp: Date.now()
             };
     
             localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
         } catch (error) {
             console.error('Cache write error:', error);
         }
     }
     
     async function fetchWithCache(url) {
         try {
             const cacheKey = url;
             const cached = getFromCache(cacheKey);
     
             if (cached) {
                 console.log('Using cached data for:', url);
                 return cached;
             }
     
             const response = await fetch(url, {
                 headers: API_CONFIG.coingecko.headers
             });
     
             if (!response.ok) {
                 throw new Error(`API request failed: ${response.status} ${response.statusText}`);
             }
     
             const data = await response.json();
             saveToCache(cacheKey, data);
             
             return data;
         } catch (error) {
             console.error('Fetch error:', error);
             return {
                 error: true,
                 message: error.message,
                 timestamp: Date.now()
             };
         }
     }
     
     async function fetchTokenData(coinId) {
         try {
             const [priceData, infoData] = await Promise.all([
                 fetchWithCache(`${API_CONFIG.coingecko.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true`),
                 fetchWithCache(`${API_CONFIG.coingecko.baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`)
             ]);
     
             if (priceData.error || infoData.error) {
                 throw new Error('Failed to fetch complete token data');
             }
     
             return {
                 marketCap: priceData[coinId]?.usd_market_cap || 'N/A',
                 logo: infoData.image?.small || '',
                 name: infoData.name || coinId
             };
         } catch (error) {
             console.error(`Error fetching data for ${coinId}:`, error);
             return {
                 marketCap: 'N/A',
                 logo: '',
                 name: coinId,
                 error: true
             };
         }
     }
     
     function formatMarketCap(marketCap) {
         if (marketCap === 'N/A') return 'N/A';
         if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
         if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
         if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
         return `$${marketCap.toFixed(2)}`;
     }
     
     function getSupplyRow(coin, tokenData) {
     const formattedMarketCap = formatMarketCap(tokenData.marketCap);
     const supplyApy = '-'; 
     const collateralFactor = (Math.random() * 60 + 40).toFixed(0);
     const balance = tokenData.balance || '0.00';
 
     return `
         <tr class="asset-row cursor-pointer hover:bg-purple-500/10 transition-colors"
             onclick="openModal({
                 symbol: '${coin.symbol}',
                 name: '${tokenData.name}',
                 logo: '${tokenData.logo}',
                 balance: '${balance}',
                 available: '${balance}',
                 apy: '${supplyApy}',
                 collateralFactor: '${collateralFactor}'
             }, 'SUPPLY')">
             <td class="px-6 py-4">
                 <div class="flex items-center gap-3">
                     <img src="${tokenData.logo}" alt="${coin.symbol}" class="w-8 h-8 rounded-full ring-2 ring-purple-500/20">
                     <div>
                         <div class="font-medium">${coin.symbol}</div>
                         <div class="text-sm text-gray-400">${tokenData.name}</div>
                     </div>
                 </div>
             </td>
             <td class="text-right px-6 py-4 text-gray-400">${formattedMarketCap}</td>
             <td class="text-right px-6 py-4 text-green-400 font-medium">${supplyApy}%</td>
 <td class="text-right px-6 py-4 font-medium text-xs">${balance} ${coin.symbol}</td>
         </tr>
     `;
 }
     
     function getBorrowRow(coin, tokenData) {
     const formattedMarketCap = formatMarketCap(tokenData.marketCap);
     const borrowApy = '-';
     const protocolLiquidity = 0; 
     const collateralFactor = (Math.random() * 60 + 40).toFixed(0);
 
     return `
         <tr class="asset-row cursor-pointer hover:bg-purple-500/10 transition-colors"
             onclick="openModal({
                 symbol: '${coin.symbol}',
                 name: '${tokenData.name}',
                 logo: '${tokenData.logo}',
                 balance: '0.00',
                 available: '${protocolLiquidity}',
                 apy: '${borrowApy}',
                 collateralFactor: '${collateralFactor}'
             }, 'BORROW')">
             <td class="px-6 py-4">
                 <div class="flex items-center gap-3">
                     <img src="${tokenData.logo}" alt="${coin.symbol}" class="w-8 h-8 rounded-full ring-2 ring-purple-500/20">
                     <div>
                         <div class="font-medium">${coin.symbol}</div>
                         <div class="text-sm text-gray-400">${tokenData.name}</div>
                     </div>
                 </div>
             </td>
             <td class="text-right px-6 py-4 text-gray-400">${formattedMarketCap}</td>
             <td class="text-right px-6 py-4 font-medium">${borrowApy}%</td>
             <td class="text-right px-6 py-4 font-medium text-xs">${protocolLiquidity.toLocaleString()} ${coin.symbol}</td>
         </tr>
     `;
 }
     
 async function populateTables() {
     const supplyTableBody = document.getElementById('supply-assets');
     const borrowTableBody = document.getElementById('borrow-assets');
 
     // Show loading state
     supplyTableBody.innerHTML = `
         <tr><td colspan="4" class="text-center py-4">
             <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
         </td></tr>
     `;
     borrowTableBody.innerHTML = supplyTableBody.innerHTML;
 
     try {
 
         const tokenDataPromises = MEMECOINS.map(coin => fetchTokenData(coin.id));
         const tokenDataResults = await Promise.all(tokenDataPromises);
 
 
         const tokensWithData = MEMECOINS.map((coin, index) => ({
             coin,
             tokenData: tokenDataResults[index],
             marketCap: tokenDataResults[index].marketCap || 0,
             balance: lastKnownBalances[coin.symbol] || 0
         }));
 
 
         if (walletAddress) {
 
             tokensWithData.sort((a, b) => {
 
                 if (b.balance !== a.balance) {
                     return b.balance - a.balance;
                 }
 
                 const mcapA = typeof a.marketCap === 'string' ? 0 : parseFloat(a.marketCap);
                 const mcapB = typeof b.marketCap === 'string' ? 0 : parseFloat(b.marketCap);
                 return mcapB - mcapA;
             });
         } else {
 
             tokensWithData.sort((a, b) => {
                 const mcapA = typeof a.marketCap === 'string' ? 0 : parseFloat(a.marketCap);
                 const mcapB = typeof b.marketCap === 'string' ? 0 : parseFloat(b.marketCap);
                 return mcapB - mcapA;
             });
         }
 
 
         supplyTableBody.innerHTML = '';
         borrowTableBody.innerHTML = '';
 
         tokensWithData.forEach(({ coin, tokenData, balance }) => {
 
             const supplyRow = getSupplyRow(coin, {
                 ...tokenData,
                 balance: balance
             });
             const borrowRow = getBorrowRow(coin, tokenData);
             
             supplyTableBody.insertAdjacentHTML('beforeend', supplyRow);
             borrowTableBody.insertAdjacentHTML('beforeend', borrowRow);
         });
     } catch (error) {
         console.error('Population error:', error);
         const errorHTML = `
             <tr><td colspan="4" class="text-center py-4 text-red-400">
                 Error loading data. Please try again.
             </td></tr>
         `;
         supplyTableBody.innerHTML = errorHTML;
         borrowTableBody.innerHTML = errorHTML;
     }
 }
     function setupSearch() {
         const searchInputs = document.querySelectorAll('input[type="text"]');
         searchInputs.forEach(input => {
             input.addEventListener('input', (e) => {
                 const searchTerm = e.target.value.toLowerCase();
                 const tableBody = e.target.closest('.glass').querySelector('tbody');
                 const rows = tableBody.querySelectorAll('tr');
     
                 rows.forEach(row => {
                     const symbol = row.querySelector('.font-medium')?.textContent.toLowerCase();
                     const name = row.querySelector('.text-sm.text-gray-400')?.textContent.toLowerCase();
                     
                     if (!symbol || !name) return;
     
                     const match = symbol.includes(searchTerm) || name.includes(searchTerm);
                     row.style.display = match ? '' : 'none';
                 });
             });
         });
     }
     
     // Initialize when the page loads
     document.addEventListener('DOMContentLoaded', () => {
         populateTables();
         setupSearch();
         
         // Refresh data every 5 minutes
         setInterval(populateTables, 5 * 60 * 1000);
     });
 
         // ============= wallet connection =============//
         // ============= wallet connection =============//
         // ============= wallet connection =============//
 // Define constants first
 const RPC_ENDPOINT = 'https://elisa-y8ignw-fast-mainnet.helius-rpc.com';
 
 // Wallet connection states
 let walletAddress = null;
 
 // Check if Phantom is installed - single definition
 const getProvider = () => {
     if ('phantom' in window) {
         const provider = window.phantom?.solana;
 
         if (provider?.isPhantom) {
             return provider;
         }
     }
 
     window.open('https://phantom.app/', '_blank');
 };
 
 // Fetch SOL balance
 async function getSOLBalance(publicKey) {
     try {
         const provider = getProvider();
         const connection = new window.solanaWeb3.Connection(RPC_ENDPOINT, 'confirmed');
         const balance = await connection.getBalance(new window.solanaWeb3.PublicKey(publicKey));
         return balance / 1e9; // Convert lamports to SOL
     } catch (err) {
         console.error('Error fetching balance:', err);
         return null;
     }
 }
 
 
 // Update wallet display
 // Update wallet display
 // Update wallet display
 
 
 
 async function updateWalletDisplay(address) {
     const truncatedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
     const button = document.querySelector('.launch-app-btn');
     const walletBalance = document.querySelector('.wallet-balance');
     const balanceAmount = document.querySelector('.balance-amount');
     
     // Update wallet address button
     button.innerHTML = `
         <span>${truncatedAddress}</span>
         <svg class="header-connected-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
         </svg>
     `;
     button.classList.add('connected');
     
     // Update balance and ensure visibility
     const balance = await getSOLBalance(address);
     if (balance !== null) {
         balanceAmount.textContent = `${balance.toFixed(2)} SOL`;
         walletBalance.classList.remove('hidden');
     }
 }
 
 // Add this helper function to check if elements exist
 function checkWalletElements() {
     const walletBalance = document.querySelector('.wallet-balance');
     const balanceAmount = document.querySelector('.balance-amount');
     if (!walletBalance || !balanceAmount) {
         console.error('Wallet balance elements not found in DOM');
         return false;
     }
     return true;
 }
 // Connect to Phantom wallet with updated RPC
 // Connect to Phantom wallet with updated RPC and parallel balance updates
 async function connectWallet() {
     try {
         const provider = getProvider();
         
         if (provider) {
             provider.connect({ onlyIfTrusted: false })
                 .then(async ({ publicKey }) => {
                     walletAddress = publicKey.toString();
                     
                     // Update wallet address display immediately
                     const button = document.querySelector('.launch-app-btn');
                     const truncatedAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
                     button.innerHTML = `
                         <span>${truncatedAddress}</span>
                         <svg class="header-connected-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                         </svg>
                     `;
                     button.classList.add('connected');
                     
                     // Show loading state for SOL balance
                     const balanceAmount = document.querySelector('.balance-amount');
                     balanceAmount.innerHTML = `
                         <div class="flex items-center gap-2">
                             <div class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                             <span>Loading...</span>
                         </div>
                     `;
                     document.querySelector('.wallet-balance').classList.remove('hidden');
                     
                     // Show loading state for supply balances only
                     const supplyRows = document.querySelectorAll('#supply-assets tr.asset-row');
                     supplyRows.forEach(row => {
                         const balanceCell = row.querySelector('td:last-child');
                         if (balanceCell) {
                             balanceCell.innerHTML = `
                                 <div class="flex items-center justify-end">
                                     <div class="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full"></div>
                                 </div>
                             `;
                         }
                     });
                     
                     // Fetch SOL balance and token balances in parallel
                     try {
                         const [solBalance, tokenBalances] = await Promise.all([
                             getSOLBalance(walletAddress),
                             getAllTokenBalances(walletAddress)
                         ]);
 
                         // Update SOL balance display
                         if (solBalance !== null) {
                             balanceAmount.textContent = `${solBalance.toFixed(2)} SOL`;
                         }
                         
                         // Update token balances
                         updateUIWithBalances(tokenBalances);
                         
                         // Store connection in session
                         sessionStorage.setItem('walletAddress', walletAddress);
                         
                         // Start balance refresh
                         startBalanceRefresh();
                     } catch (error) {
                         console.error('Error fetching balances:', error);
                         // Show error state in UI for SOL balance and supply balances only
                         balanceAmount.textContent = 'Error loading balance';
                         supplyRows.forEach(row => {
                             const balanceCell = row.querySelector('td:last-child');
                             if (balanceCell) {
                                 balanceCell.textContent = 'Error loading balance';
                             }
                         });
                     }
                 })
                 .catch((err) => {
                     console.error('Error connecting to wallet:', err);
                     disconnectWallet();
                 });
         }
     } catch (err) {
         console.error('Error initializing wallet connection:', err);
         disconnectWallet();
     }
 }
 // Disconnect wallet
 // Update disconnect function
 function disconnectWallet() {
     walletAddress = null;
     sessionStorage.removeItem('walletAddress');
     
     // Reset UI state
     const button = document.querySelector('.launch-app-btn');
     // Change this line to use wallet-balance
     const walletBalance = document.querySelector('.wallet-balance');
     const dropdown = document.querySelector('.wallet-dropdown');
     
     button.innerHTML = 'Connect Wallet';
     button.classList.remove('connected');
     walletBalance.classList.add('hidden');  // Changed from sol-balance to wallet-balance
     dropdown.classList.add('hidden');
 }
 
 // Toggle dropdown menu
 function toggleDropdown(event) {
     if (!walletAddress) return;
     
     event.stopPropagation();
     const dropdown = document.querySelector('.wallet-dropdown');
     dropdown.classList.toggle('hidden');
 }
 
 // Handle dropdown options
 function handleDropdownOption(action) {
     switch(action) {
         case 'viewExplorer':
             window.open(`https://solscan.io/account/${walletAddress}`, '_blank');
             break;
         case 'disconnect':
             disconnectWallet();
             break;
     }
     // Hide dropdown after action
     document.querySelector('.wallet-dropdown').classList.add('hidden');
 }
 
 // Refresh balance periodically
 
 // Update refresh function to use new RPC
 // Update the balance refresh function to also use parallel fetching
 function startBalanceRefresh() {
     const refreshInterval = setInterval(async () => {
         if (walletAddress) {
             try {
                 // Fetch both SOL and token balances in parallel
                 const [solBalance, tokenBalances] = await Promise.all([
                     getSOLBalance(walletAddress),
                     getAllTokenBalances(walletAddress)
                 ]);
                 
                 // Update SOL balance
                 if (solBalance !== null) {
                     const balanceAmount = document.querySelector('.balance-amount');
                     if (balanceAmount) {
                         balanceAmount.textContent = `${solBalance.toFixed(2)} SOL`;
                     }
                 }
                 
                 // Update token balances
                 updateUIWithBalances(tokenBalances);
             } catch (err) {
                 console.error('Error refreshing balances:', err);
             }
         } else {
             clearInterval(refreshInterval);
         }
     }, 5000); // Refresh every 5 seconds
 }
 
 // Also update the initialization check for existing session
 // Also update the initialization check for existing session
 function initializeWallet() {
     // Add click handlers
     document.addEventListener('click', (e) => {
         const dropdown = document.querySelector('.wallet-dropdown');
         if (dropdown && !dropdown.contains(e.target) && !e.target.closest('.launch-app-btn')) {
             dropdown.classList.add('hidden');
         }
     });
     
     const connectButton = document.querySelector('.launch-app-btn');
     connectButton.addEventListener('click', async (e) => {
         e.preventDefault();
         if (!walletAddress) {
             await connectWallet();
         } else {
             toggleDropdown(e);
         }
     });
     
     // Check for existing connection and load balances immediately
     const savedAddress = sessionStorage.getItem('walletAddress');
     if (savedAddress) {
         walletAddress = savedAddress;
         // Update interface immediately
         updateWalletDisplay(walletAddress);
         
         // Fetch initial balances
         Promise.all([
             getSOLBalance(walletAddress),
             getAllTokenBalances(walletAddress)
         ]).then(([solBalance, tokenBalances]) => {
             // Update SOL balance
             if (solBalance !== null) {
                 const balanceAmount = document.querySelector('.balance-amount');
                 if (balanceAmount) {
                     balanceAmount.textContent = `${solBalance.toFixed(2)} SOL`;
                 }
             }
             
             // Update token balances
             updateUIWithBalances(tokenBalances);
             
             // Start refresh cycle
             startBalanceRefresh();
         }).catch(error => {
             console.error('Error loading initial balances:', error);
         });
     }
     
     // Listen for account changes
     if (window.phantom?.solana) {
         window.phantom.solana.on('accountChanged', async (publicKey) => {
             if (publicKey) {
                 walletAddress = publicKey.toString();
                 await updateWalletDisplay(walletAddress);
                 const tokenBalances = await getAllTokenBalances(walletAddress);
                 updateUIWithBalances(tokenBalances);
             } else {
                 disconnectWallet();
             }
         });
     }
 }
 // Initialize when the page loads
 document.addEventListener('DOMContentLoaded', initializeWallet);
 
 
 
  // GET ALL BALANCED FOR OTKENS:
 
 // Token mint addresses
 const TOKEN_MINTS = {
     'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
     'PNUT': '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump',
     '$WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
     'POPCAT': '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
     'MYRO': 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
     'LUCE': 'CBdCxKo9QavR9hfShgpEBG3zekorAeD7W1jfq2o3pump',
     'ZEREBRO': '8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn',
     'GOAT': 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump',
     'CHILL': 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump'
 };
 
 // Create reverse mapping for quick lookups
 const MINT_TO_SYMBOL = Object.entries(TOKEN_MINTS).reduce((acc, [symbol, mint]) => {
     acc[mint] = symbol;
     return acc;
 }, {});
 
 // Create connection using Helius RPC
 const connection = new solanaWeb3.Connection(RPC_ENDPOINT, 'confirmed');
 
 // Fetch all token balances in one query
 async function getAllTokenBalances(walletAddress) {
     try {
         const owner = new solanaWeb3.PublicKey(walletAddress);
         
         // Get all token accounts for the wallet
         const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
             programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
         });
 
         // Create a map of mint addresses to balances
         const balances = {};
         
         // Initialize all tokens with 0 balance
         Object.keys(TOKEN_MINTS).forEach(symbol => {
             balances[symbol] = 0;
         });
 
         // Process token accounts
         tokenAccounts.value.forEach(account => {
             const parsedInfo = account.account.data.parsed.info;
             const mintAddress = parsedInfo.mint;
             
             // Check if this is one of our tracked tokens
             const symbol = MINT_TO_SYMBOL[mintAddress];
             if (symbol) {
                 balances[symbol] = parseFloat(parsedInfo.tokenAmount.uiAmount || 0);
             }
         });
 
         return balances;
     } catch (error) {
         console.error('Error fetching token balances:', error);
         return {};
     }
 }
 
 
 function updateUIWithBalances(balances) {
     // Guard against undefined balances
     if (!balances) {
         console.error('Received undefined balances');
         return;
     }
 
     // Store the new balances globally
     lastKnownBalances = { ...balances };
     
     // Get the table body
     const supplyTableBody = document.getElementById('supply-assets');
     if (!supplyTableBody) {
         console.error('Supply table body not found');
         return;
     }
 
     // Get all rows and their data
     const rows = Array.from(supplyTableBody.querySelectorAll('tr.asset-row')).map(row => {
         const symbol = row.querySelector('.font-medium')?.textContent;
         const marketCapText = row.querySelector('td:nth-child(2)')?.textContent;
         const marketCap = parseMarketCap(marketCapText);
         // Add null check for balance lookup
         const balance = symbol && lastKnownBalances[symbol] !== undefined ? lastKnownBalances[symbol] : 0;
 
         return {
             element: row,
             symbol,
             marketCap,
             balance
         };
     }).filter(row => row.symbol); // Filter out any rows without a symbol
 
     // Sort the rows
     rows.sort((a, b) => {
         // If both have non-zero balances, compare balances
         if (a.balance > 0 && b.balance > 0) {
             return b.balance - a.balance;
         }
         // If only one has balance, it goes first
         if (a.balance > 0) return -1;
         if (b.balance > 0) return 1;
         // If neither has balance, compare market caps
         return b.marketCap - a.marketCap;
     });
 
     // Remove existing rows
     supplyTableBody.innerHTML = '';
 
     // Reinsert rows in sorted order and update their content
     rows.forEach(row => {
         try {
             // Update the balance display before reinserting
             const balanceCell = row.element.querySelector('td:last-child');
             if (balanceCell && row.symbol) {
                 const balance = Number(lastKnownBalances[row.symbol] || 0);
                 balanceCell.textContent = `${balance.toLocaleString(undefined, {
                     minimumFractionDigits: 2,
                     maximumFractionDigits: 2
                 })} ${row.symbol}`;
             }
 
             // Update onclick handler with new balance
             if (row.symbol) {
                 const balance = Number(lastKnownBalances[row.symbol] || 0);
                 row.element.setAttribute('onclick', row.element.getAttribute('onclick').replace(
                     /balance: '[^']*'/,
                     `balance: '${balance.toString()}'`
                 ));
             }
 
             // Reinsert the row
             supplyTableBody.appendChild(row.element);
         } catch (error) {
             console.error('Error updating row:', error, row);
         }
     });
 }
 function parseMarketCap(marketCapText) {
     if (!marketCapText || marketCapText === 'N/A') return 0;
     
     // Remove the $ and any commas
     const cleaned = marketCapText.replace(/[$,]/g, '');
     
     // Check for B/M/K suffixes and convert accordingly
     if (cleaned.includes('B')) {
         return parseFloat(cleaned) * 1e9;
     } else if (cleaned.includes('M')) {
         return parseFloat(cleaned) * 1e6;
     } else if (cleaned.includes('K')) {
         return parseFloat(cleaned) * 1e3;
     }
     return parseFloat(cleaned);
 }