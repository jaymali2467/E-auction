import React, { useState, useEffect } from 'react';
import './App.css';

// --- CONFIGURATION ---
const API_URL = "https://sheetdb.io/api/v1/rbdtbikekxlgm"; 

// --- DATABASE ---
const MASTER_COMPANIES = [
  // SECTOR 1: TECHNOLOGY
  { id: 1, name: "Apple", sector: "Technology", trait: "Stable", points: 1000 },
  { id: 2, name: "Microsoft", sector: "Technology", trait: "Stable", points: 850 },
  { id: 3, name: "Google", sector: "Technology", trait: "Balanced", points: 700 },
  { id: 4, name: "Infosys", sector: "Technology", trait: "Balanced", points: 700 },
  { id: 5, name: "Paytm", sector: "Technology", trait: "Growth", points: 400 },
  { id: 6, name: "Snowflake", sector: "Technology", trait: "Growth", points: 400 },

  // SECTOR 2: FINANCE
  { id: 7, name: "JPMorgan Chase", sector: "Finance", trait: "Stable", points: 1000 },
  { id: 8, name: "HDFC Bank", sector: "Finance", trait: "Stable", points: 850 },
  { id: 9, name: "Visa", sector: "Finance", trait: "Balanced", points: 700 },
  { id: 10, name: "Mastercard", sector: "Finance", trait: "Balanced", points: 700 },
  { id: 11, name: "Zerodha", sector: "Finance", trait: "Volatile", points: 400 },
  { id: 12, name: "Robinhood", sector: "Finance", trait: "Volatile", points: 400 },

  // SECTOR 3: ENERGY
  { id: 13, name: "Reliance Industries", sector: "Energy", trait: "Balanced", points: 1000 },
  { id: 14, name: "ExxonMobil", sector: "Energy", trait: "Volatile", points: 850 },
  { id: 15, name: "Shell", sector: "Energy", trait: "Volatile", points: 700 },
  { id: 16, name: "Adani Green Energy", sector: "Energy", trait: "Growth", points: 700 },
  { id: 17, name: "NextEra Energy", sector: "Energy", trait: "Growth", points: 700 },
  { id: 18, name: "NTPC", sector: "Energy", trait: "Balanced", points: 400 },

  // SECTOR 4: FMCG
  { id: 19, name: "Hindustan Unilever", sector: "FMCG", trait: "Stable", points: 1000 },
  { id: 20, name: "Nestlé", sector: "FMCG", trait: "Stable", points: 850 },
  { id: 21, name: "ITC", sector: "FMCG", trait: "Stable", points: 700 },
  { id: 22, name: "Procter & Gamble", sector: "FMCG", trait: "Balanced", points: 700 },
  { id: 23, name: "Zomato", sector: "FMCG", trait: "Volatile", points: 400 },
  { id: 24, name: "DoorDash", sector: "FMCG", trait: "Volatile", points: 400 },

  // SECTOR 5: HEALTHCARE
  { id: 25, name: "Pfizer", sector: "Healthcare", trait: "Stable", points: 1000 },
  { id: 26, name: "Johnson & Johnson", sector: "Healthcare", trait: "Stable", points: 850 },
  { id: 27, name: "Sun Pharma", sector: "Healthcare", trait: "Balanced", points: 700 },
  { id: 28, name: "Roche", sector: "Healthcare", trait: "Balanced", points: 700 },
  { id: 29, name: "Biocon", sector: "Healthcare", trait: "Growth", points: 400 },
  { id: 30, name: "Moderna", sector: "Healthcare", trait: "Growth", points: 400 },

  // SECTOR 6: MANUFACTURING
  { id: 31, name: "Tata Steel", sector: "Manufacturing", trait: "Volatile", points: 1000 },
  { id: 32, name: "Larsen & Toubro", sector: "Manufacturing", trait: "Balanced", points: 850 },
  { id: 33, name: "Siemens", sector: "Manufacturing", trait: "Balanced", points: 700 },
  { id: 34, name: "Caterpillar", sector: "Manufacturing", trait: "Volatile", points: 700 },
  { id: 35, name: "ABB", sector: "Manufacturing", trait: "Growth", points: 400 },
  { id: 36, name: "Bharat Forge", sector: "Manufacturing", trait: "Volatile", points: 400 },

  // SECTOR 7: MOBILITY
  { id: 37, name: "Tesla", sector: "Mobility", trait: "Growth", points: 1000 },
  { id: 38, name: "Toyota", sector: "Mobility", trait: "Stable", points: 850 },
  { id: 39, name: "Maruti Suzuki", sector: "Mobility", trait: "Volatile", points: 700 },
  { id: 40, name: "Uber", sector: "Mobility", trait: "Volatile", points: 700 },
  { id: 41, name: "BYD", sector: "Mobility", trait: "Growth", points: 400 },
  { id: 42, name: "Ola Electric", sector: "Mobility", trait: "Growth", points: 400 },

  // SECTOR 8: MEDIA
  { id: 43, name: "Disney", sector: "Media", trait: "Stable", points: 1000 },
  { id: 44, name: "Sony", sector: "Media", trait: "Balanced", points: 850 },
  { id: 45, name: "Netflix", sector: "Media", trait: "Growth", points: 700 },
  { id: 46, name: "Zee Entertainment", sector: "Media", trait: "Volatile", points: 700 },
  { id: 47, name: "JioHotstar", sector: "Media", trait: "Balanced", points: 400 },
  { id: 48, name: "PVR INOX", sector: "Media", trait: "Volatile", points: 400 }
];

const TRAIT_RULES = {
  "Stable":   { pos: 1.20, neg: 1.00 }, // Immune to negative
  "Volatile": { pos: 1.50, neg: 0.50 }, 
  "Growth":   { pos: 1.50, neg: 1.00 }, // Immune to negative
  "Balanced": { pos: 1.20, neg: 0.80 }  
};

const EVENTS = [
  { name: "Post-Pandemic Recovery", impacts: { Manufacturing: 1, Mobility: 1, Technology: 1, FMCG: 1 } },
  { name: "Global Financial Crisis", impacts: { Manufacturing: -1, Mobility: -1, Media: -1, FMCG: -1 } },
  { name: "Central Bank Rate Hike", impacts: { Finance: 1, Manufacturing: -1, Technology: -1 } },
  { name: "Cheap Money Era", impacts: { Manufacturing: 1, Technology: 1, Finance: -1 } },
  { name: "National Infrastructure Mission", impacts: { Manufacturing: 1, Energy: 1 } },
  { name: "Regulatory Crackdown", impacts: { Finance: -1, Technology: -1, Energy: -1 } },
  { name: "Ease-of-Doing-Business", impacts: { Manufacturing: 1, Finance: 1, Technology: 1 } },
  { name: "Global Supply Chain Breakdown", impacts: { Technology: -1, Manufacturing: -1, Healthcare: -1, FMCG: 1 } },
  { name: "Energy Price Spike", impacts: { Energy: 1, Manufacturing: -1, Mobility: -1, FMCG: -1 } },
  { name: "Energy Price Crash", impacts: { Energy: -1, Manufacturing: 1, Mobility: 1 } },
  { name: "Festive Consumption Boom", impacts: { FMCG: 1, Media: 1, Mobility: 1 } },
  { name: "Pandemic Outbreak", impacts: { Healthcare: 1, Mobility: -1, Media: -1 } }
];

// 1.3 multiplier for all (Flat Bonus)
const CEOS = [
  { name: "Tech Visionary", sector: "Technology", multiplier: 1.3 },
  { name: "Banking Strategist", sector: "Finance", multiplier: 1.3 },
  { name: "Energy Czar", sector: "Energy", multiplier: 1.3 },
  { name: "Consumer Baron", sector: "FMCG", multiplier: 1.3 },
  { name: "Healthcare Leader", sector: "Healthcare", multiplier: 1.3 },
  { name: "Infrastructure Builder", sector: "Manufacturing", multiplier: 1.3 },
  { name: "Mobility Disruptor", sector: "Mobility", multiplier: 1.3 },
  { name: "Media Mogul", sector: "Media", multiplier: 1.3 }
];

export default function App() {
  const [view, setView] = useState('SETUP');
  const [loading, setLoading] = useState(false);
  
  // SETUP STATE
  const [teamCount, setTeamCount] = useState(40);
  const [monopolyMode, setMonopolyMode] = useState(false);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState(MASTER_COMPANIES.map(c => c.id));
  const [selectedEventNames, setSelectedEventNames] = useState(EVENTS.map(e => e.name));

  // GAME STATE
  const [teams, setTeams] = useState([]);
  const [companies, setCompanies] = useState([]); 
  const [activeEvents, setActiveEvents] = useState([]);
  
  // ACTION STATE
  const [mode, setMode] = useState('BUY'); 
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [eventToTrigger, setEventToTrigger] = useState('');
  const [selectedCeoName, setSelectedCeoName] = useState('');

  // --- HELPERS ---
  const formatMoney = (amount) => "₹" + Math.round(amount).toLocaleString('en-IN');
  
  // --- CORE LOGIC: CALCULATE POINTS DYNAMICALLY ---
  // This calculates the LIVE score based on: Base Points * CEO Multiplier * Monopoly Multiplier
  const calculateLivePoints = (company, team) => {
    let pts = company.points; // Start with Base Points (modified by events)

    // 1. Apply CEO Multiplier (1.3x)
    const hasCEO = team.owned_ceos.find(c => c.sector === company.sector);
    if (hasCEO) {
      pts = pts * hasCEO.multiplier;
    }

    // 2. Apply Monopoly Bonus (1.3x)
    if (monopolyMode) {
      // Check if team has 3+ companies in this sector
      const sectorCount = team.inventory.filter(i => i.sector === company.sector).length;
      if (sectorCount >= 3) {
        pts = pts * 1.3;
      }
    }

    return pts;
  };

  const getPortfolioValue = (team) => {
    return team.inventory.reduce((sum, item) => {
      return sum + calculateLivePoints(item, team);
    }, 0);
  };

  // --- SHEETDB CONNECTIVITY ---
  const syncFromSheet = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const syncedTeams = data.map(row => ({
        id: parseInt(row.id),
        name: row.name,
        cash: parseInt(row.cash),
        inventory: JSON.parse(row.inventory || "[]"),
        owned_ceos: JSON.parse(row.owned_ceos || "[]")
      }));
      setTeams(syncedTeams);
      alert("Synced successfully!");
    } catch (e) {
      alert("Sync Failed: " + e.message);
    }
    setLoading(false);
  };

  // --- ACTIONS ---
  const toggleCompany = (id) => {
    setSelectedCompanyIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleEvent = (name) => {
    setSelectedEventNames(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  };

  const startGame = () => {
    const newTeams = Array.from({ length: parseInt(teamCount) }, (_, i) => ({
      id: i + 1, name: `Team ${i + 1}`, cash: 1000000, inventory: [], owned_ceos: [] 
    }));
    setTeams(newTeams);
    setCompanies(MASTER_COMPANIES.filter(c => selectedCompanyIds.includes(c.id)));
    setActiveEvents(EVENTS.filter(e => selectedEventNames.includes(e.name)));
    setView('GAME');
  };

  const handleBuyAsset = () => {
    if (!selectedTeamId || !selectedCompanyId || !bidAmount) return alert("Missing Info");
    const teamIdx = teams.findIndex(t => t.id === parseInt(selectedTeamId));
    const company = companies.find(c => c.id === parseInt(selectedCompanyId));
    const cost = parseInt(bidAmount);
    if (teams[teamIdx].cash < cost) return alert("Not enough cash!");

    const newTeams = [...teams];
    newTeams[teamIdx].cash -= cost;
    newTeams[teamIdx].inventory.push({ ...company, boughtAt: cost });
    setTeams(newTeams);
    setBidAmount('');
  };

  const handleBuyCEO = () => {
    if (!selectedTeamId || !selectedCeoName || !bidAmount) return alert("Missing Info");
    const teamIdx = teams.findIndex(t => t.id === parseInt(selectedTeamId));
    const cost = parseInt(bidAmount);
    const ceo = CEOS.find(c => c.name === selectedCeoName);
    if (teams[teamIdx].cash < cost) return alert("Not enough cash!");
    
    const newTeams = [...teams];
    newTeams[teamIdx].cash -= cost;
    newTeams[teamIdx].owned_ceos.push(ceo);
    setTeams(newTeams);
    setBidAmount('');
    alert(`SOLD: ${ceo.name} to ${newTeams[teamIdx].name}`);
  };

  const handleSellBack = () => {
    if (!selectedTeamId || !selectedCompanyId) return alert("Select Team & Asset");
    const teamIdx = teams.findIndex(t => t.id === parseInt(selectedTeamId));
    const team = teams[teamIdx];
    const assetIdx = team.inventory.findIndex(c => c.id === parseInt(selectedCompanyId));
    if (assetIdx === -1) return alert("Asset not found");
    const asset = team.inventory[assetIdx];
    const refund = Math.floor(asset.boughtAt * 0.5);
    const newTeams = [...teams];
    newTeams[teamIdx].cash += refund;
    newTeams[teamIdx].inventory.splice(assetIdx, 1); 
    setTeams(newTeams);
    alert(`REFUNDED: ₹${refund}`);
  };

  // UPDATED: Only update Base Points (CEO logic is now handled in getPortfolioValue)
  const handleTriggerEvent = () => {
    if (!eventToTrigger) return;
    const impacts = activeEvents.find(e => e.name === eventToTrigger).impacts;
    
    // 1. Update Market Prices (Base Points)
    const newCompanies = companies.map(comp => applyEventMath(comp, impacts));
    
    // 2. Update Team Inventories (Update their Base Points only)
    const newTeams = teams.map(team => {
      const updatedInventory = team.inventory.map(item => {
        // Find the new version of this company from the market update
        const updatedComp = newCompanies.find(c => c.id === item.id);
        // Keep the purchase data, but update the base points
        return { ...item, points: updatedComp ? updatedComp.points : item.points };
      });
      return { ...team, inventory: updatedInventory };
    });
    
    setCompanies(newCompanies);
    setTeams(newTeams);
    alert(`EVENT APPLIED: ${eventToTrigger}`);
  };

  // Logic: Only Traits affect Base Points
  const applyEventMath = (comp, impacts) => {
    const direction = impacts[comp.sector]; 
  
    if (direction) {
      const rules = TRAIT_RULES[comp.trait];
      
      // Get Multiplier (e.g. 1.20 or 0.50)
      let traitMult = direction === 1 ? rules.pos : rules.neg;
      
      // BUG FIX: If Stable/Growth and multiplier is 1.0 (Immune), do NOT change anything.
      // This prevents accidental point loss due to float rounding or logic errors.
      if (traitMult === 1.0) return comp;

      const newPoints = Math.round(comp.points * traitMult);
      return { ...comp, points: newPoints };
    }
    return comp;
  };

  // --- RENDER HELPERS ---
  const activeTeam = teams.find(t => t.id === parseInt(selectedTeamId));
  const getAvailableMarketCompanies = () => {
    const ownedIds = new Set();
    teams.forEach(t => t.inventory.forEach(item => ownedIds.add(item.id)));
    return companies.filter(c => !ownedIds.has(c.id));
  };

  const getRefundAmount = () => {
    if (!selectedCompanyId || !activeTeam) return 0;
    const asset = activeTeam.inventory.find(c => c.id == selectedCompanyId);
    return asset ? asset.boughtAt * 0.5 : 0;
  };

  if (view === 'SETUP') return (
    <div className="app-container setup-view">
      <h1 className="glitch">E-AUCTION // SETUP</h1>
      <div className="setup-grid">
        <div className="setup-card">
          <label>TOTAL TEAMS</label>
          <input type="number" value={teamCount} onChange={e => setTeamCount(e.target.value)} className="big-input"/>
          <div className="monopoly-toggle" style={{marginTop: '20px', padding: '10px', border: '1px solid #333'}}>
            <label style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <input type="checkbox" checked={monopolyMode} onChange={e => setMonopolyMode(e.target.checked)} style={{width:'20px', height:'20px'}}/>
              ENABLE BONUS (3+ same sector = 1.3x)
            </label>
          </div>
        </div>
        <div className="setup-card scrollable">
          <h3>SELECT COMPANIES</h3>
          {MASTER_COMPANIES.map(c => (
             <div key={c.id} style={{display:'flex', gap:'10px'}}>
               <input type="checkbox" checked={selectedCompanyIds.includes(c.id)} onChange={() => toggleCompany(c.id)}/>
               <span>{c.name} ({c.sector})</span>
             </div>
          ))}
        </div>
        <div className="setup-card scrollable">
          <h3>SELECT EVENTS</h3>
          {EVENTS.map(e => (
             <div key={e.name} style={{display:'flex', gap:'10px'}}>
               <input type="checkbox" checked={selectedEventNames.includes(e.name)} onChange={() => toggleEvent(e.name)}/>
               <span>{e.name}</span>
             </div>
          ))}
        </div>
      </div>
      <button className="start-btn" onClick={startGame}>INITIALIZE SYSTEM</button>
    </div>
  );

  return (
    <div className="app-container">
      <header>
        <div className="brand">COMMAND CENTER {monopolyMode && <span style={{color:'gold', fontSize:'0.8em'}}>[BONUS ACTIVE]</span>}</div>
        <div className="controls">
          <button className="sync-btn" onClick={syncFromSheet} disabled={loading}>{loading ? "..." : "🔄 SYNC"}</button>
          <button className="reset-btn" onClick={() => setView('SETUP')}>⚠ RESET</button>
        </div>
      </header>

      <div className="main-grid">
        <div className="card">
          <h2>TRANSACTION TERMINAL</h2>
          <div className="toggle-box">
            <button className={mode === 'BUY' ? 'active' : ''} onClick={() => setMode('BUY')}>BUY ASSET</button>
            <button className={mode === 'CEO' ? 'active ceo-mode' : ''} onClick={() => setMode('CEO')}>BUY CEO</button>
            <button className={mode === 'SELL' ? 'active sell' : ''} onClick={() => setMode('SELL')}>SELL BACK</button>
          </div>

          <select onChange={e => setSelectedTeamId(e.target.value)} value={selectedTeamId}>
            <option value="">-- Select Team --</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({formatMoney(t.cash)})</option>)}
          </select>

          {mode === 'CEO' ? (
             <>
               <select onChange={e => setSelectedCeoName(e.target.value)}>
                 <option value="">-- Select CEO --</option>
                 {CEOS.map(c => <option key={c.name} value={c.name}>{c.name} ({c.sector} x{c.multiplier})</option>)}
               </select>
               <input type="number" placeholder="CEO Bid" value={bidAmount} onChange={e => setBidAmount(e.target.value)}/>
               <button className="action-btn ceo" onClick={handleBuyCEO}>CONFIRM CEO</button>
             </>
          ) : mode === 'SELL' ? (
             <>
               <select onChange={e => setSelectedCompanyId(e.target.value)}>
                 <option value="">-- Select Asset --</option>
                 {activeTeam ? activeTeam.inventory.map(c => (
                   <option key={c.id} value={c.id}>{c.name} (Bought: {formatMoney(c.boughtAt)})</option>
                 )) : []}
               </select>
               <div className="info-box">
                 REFUND: {formatMoney(getRefundAmount())}
               </div>
               <button className="action-btn sell" onClick={handleSellBack}>CONFIRM SELL</button>
             </>
          ) : (
             <>
               <select onChange={e => setSelectedCompanyId(e.target.value)}>
                 <option value="">-- Available --</option>
                 {getAvailableMarketCompanies().map(c => (
                   <option key={c.id} value={c.id}>{c.name} ({c.sector}) ({c.points} pts)</option>
                 ))}
               </select>
               <input type="number" placeholder="Bid Amount" value={bidAmount} onChange={e => setBidAmount(e.target.value)}/>
               <button className="action-btn buy" onClick={handleBuyAsset}>CONFIRM BUY</button>
             </>
          )}
        </div>

        <div className="card">
          <h2>MARKET EVENTS</h2>
          <select onChange={e => setEventToTrigger(e.target.value)}>
            <option value="">-- Select Event --</option>
            {activeEvents.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
          </select>
          <button className="action-btn event" onClick={handleTriggerEvent}>TRIGGER EVENT</button>
        </div>
      </div>

      <div className="leaderboard-section">
        <h3>LIVE RANKINGS</h3>
        <table>
          <thead><tr><th>Rank</th><th>Team</th><th>Cash</th><th>CEOs</th><th>Assets</th><th>Portfolio Pts</th></tr></thead>
          <tbody>
            {[...teams]
              .map(t => ({ ...t, portValue: getPortfolioValue(t) }))
              .sort((a,b) => b.portValue - a.portValue)
              .map((t, idx) => (
                <tr key={t.id} className={idx < 3 ? 'top-rank' : ''}>
                  <td>#{idx + 1}</td><td>{t.name}</td>
                  <td className="num">{formatMoney(t.cash)}</td>
                  <td className="tiny-text">{t.owned_ceos.map(c => c.sector.substring(0,3)).join(', ')}</td>
                  <td className="tiny-text" style={{maxWidth:'200px', fontSize:'0.75rem', color:'#8b949e'}}>
                  {t.inventory.length > 0 ? t.inventory.map(c => {
                      const pts = calculateLivePoints(c, t); // Calculate live points per item
                      return `${c.name} (${Math.round(pts)})`;
                    }).join(', ') : '-'}
                  </td>
                  <td className="num total">{Math.round(t.portValue)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
