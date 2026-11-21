// ==UserScript==
// @name         YouTube Balanced Guard (45-Channel Allowlist & Native Feed Saturator)
// @namespace    https://github.com/ArDRaFi/youtube-balanced-guard
// @version      2.2.0
// @description  100% native YouTube UI — fills Home/Explore with 3-4 random videos from each of 45 curated balanced-paced cartoon channels + saturates Watch suggestions, blocks slop/Shorts/end-screens/autoplay, with secret PIN-protected SMART / STRICT mode toggle.
// @author       ArDRaFi
// @license      MIT
// @homepageURL  https://github.com/ArDRaFi/youtube-balanced-guard
// @supportURL   https://github.com/ArDRaFi/youtube-balanced-guard/issues
// @downloadURL  https://raw.githubusercontent.com/ArDRaFi/youtube-balanced-guard/main/youtube-balanced-guard.user.js
// @updateURL    https://raw.githubusercontent.com/ArDRaFi/youtube-balanced-guard/main/youtube-balanced-guard.user.js
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      www.youtube.com
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // ===========================================================================
  // 1. CONFIGURATION (Edit PIN or add/remove channels here anytime)
  // ===========================================================================
  const GUARD_PIN = '1234'; // Change this to your own PIN
  const DEFAULT_MODE = 'strict'; // Always starts in STRICT (Brother Mode) by default
  const DEFAULT_REDIRECT_HOME_TO_SUBS = false;
  const MAX_SHORT_SECONDS = 90; // Block clips <= 90 seconds (1:30)
  const HOME_MIN_PER_CHANNEL = 3; // Pick 3 to 4 random videos from EACH channel on Home
  const HOME_MAX_PER_CHANNEL = 4;
  const POOL_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // Refresh channel feeds every 6 hours
  const POOL_STORAGE_KEY = 'ytbg_video_pool_v3';

  // 45 Curated Balanced-Paced Official Channels (Original 24 + 21 Verified Additions)
  const APPROVED_CHANNELS = [
    // --- Original 24 Approved Channels ---
    { id: 'UCVzLLZkDuFGAE2BGdBuBNBg', handle: '@blueyofficialchannel',        name: 'Bluey - Official Channel',                            color: '#4ea8de' },
    { id: 'UCu7IDy0y-ZA0qaG51wrQY6w', handle: '@curiousgeorge',               name: 'Curious George Official',                             color: '#f4c430' },
    { id: 'UCFpAtv5HG8zFVTblY4liS5g', handle: '@durontotvbangla',             name: 'Duronto TV',                                          color: '#e76f51' },
    { id: 'UCZMKZS3L9GfhcFkMyBRoVFg', handle: '@kidslandofficial',            name: 'Kids Land',                                           color: '#2a9d8f' },
    { id: 'UCncFzSeWqySvOXEbQoEJsZg', handle: '@officiallittlebear',          name: 'Little Bear - Official',                              color: '#8d5b4c' },
    { id: 'UCA4vCk59oUmlBvyvXNiXQ7w', handle: '@magnetfilm',                  name: 'MAGNETFILM',                                          color: '#b5172a' },
    { id: 'UCu59yAFE8fM0sVNTipR4edw', handle: '@mashabearen',                 name: 'Masha and The Bear',                                  color: '#d9538f' },
    { id: 'UCjF2lVpoUweXPGf0oRJcP0A', handle: '@officialmaxruby',             name: 'Max & Ruby - Official',                               color: '#57a773' },
    { id: 'UCUkslTRrWDdmZmncHpb9sLQ', handle: '@molang',                      name: 'Molang',                                              color: '#f2a6b3' },
    { id: 'UC_AcSRRB34zUNRL_mM_BOWg', handle: '@oddbodsandarpo',              name: 'Oddbods & ARPO The Robot - Funny Cartoons for Kids',  color: '#3a86ff' },
    { id: 'UC178EmfQAV3OT-UpuO6WUMg', handle: '@omarhanaislamicsongsforkids', name: 'Omar & Hana - Islamic Cartoons for Kids',             color: '#06a77d' },
    { id: 'UCcWBs3PxTwrdlAyHIFDhkWA', handle: '@oswaldtheoctopus6123',        name: 'Oswald The Octopus',                                  color: '#4361ee' },
    { id: 'UClkIiNK6iGBHmGQSsNxjP7Q', handle: '@paddingtonbearofficial',      name: 'Paddington Bear - Official Channel',                  color: '#c84b31' },
    { id: 'UCnyAjQxYnSB9n3G2UrpD4kA', handle: '@patamat_cz',                  name: 'Pat a Mat',                                           color: '#e9c46a' },
    { id: 'UCRYJW3Ao5AOmeowheBEyKFQ', handle: '@peppapigsbigadventures',      name: "Peppa Pig's Big Adventures",                          color: '#ff7597' },
    { id: 'UCM88mtSE0zRTn5ae4EbYcuw', handle: '@pingu',                       name: 'Pingu - Official Channel',                            color: '#264653' },
    { id: 'UC3OUMU3s7Oy6Ta0wnpZFBWw', handle: '@sarahandduckofficial',        name: 'Sarah and Duck Official',                             color: '#457b9d' },
    { id: 'UCS7H8U-n5mINVJjJsaRtGHg', handle: '@shaunthesheepofficial',       name: 'Shaun the Sheep Official',                            color: '#e09f3e' },
    { id: 'UCx27Pkk8plpiosF14qXq-VA', handle: '@spongebobofficial',           name: 'SpongeBob SquarePants Official',                      color: '#f7c948' },
    { id: 'UCA8OH52te7LLg_O9T7lZFEA', handle: '@thefairlyoddparentsofficial', name: 'The Fairly OddParents - Official',                    color: '#ff66b3' },
    { id: 'UC0qrcKuayvbMtPj-WXNFylA', handle: '@thomasandfriends',            name: 'Thomas & Friends',                                    color: '#0077b6' },
    { id: 'UCXYGUeekJCrBpM32yaJpjRw', handle: '@wallaceandgromitofficial',    name: 'Wallace & Gromit',                                    color: '#6b705c' },
    { id: 'UCU0rIMU3k_AsVA8d6N1B03w', handle: '@warnerbrosclassics',          name: 'Warner Bros. Classics',                               color: '#495057' },
    { id: 'UC9trsD1jCTXXtN3xIOIU8gg', handle: '@wbkids',                      name: 'WB Kids',                                             color: '#1d4ed8' },

    // --- 21 Curated Additions: Calm Storybook, Stop-Motion/Claymation & Classic Cartoons ---
    { id: 'UCBx2mmZhRBkPC2MK4bqcSHQ', handle: '@puffinrock',                  name: 'Puffin Rock',                                         color: '#3d85c6' },
    { id: 'UCiaVa0yoJNVMwk638km8aWg', handle: '@tumbleleaf',                  name: 'Tumble Leaf - Official Channel',                      color: '#2b9348' },
    { id: 'UCj_mFUb-47d9QNiJ5556LjQ', handle: '@heyduggeeofficial',           name: 'Hey Duggee Official',                                 color: '#d97706' },
    { id: 'UCB96XQelBFLglJ9Dp6JDusA', handle: '@benandhollyslittlekingdom',   name: "Ben and Holly's Little Kingdom",                      color: '#ec4899' },
    { id: 'UCG-raE4Js-td8_muMlcveaQ', handle: '@charlieandlolaofficial',      name: 'Charlie and Lola',                                    color: '#0ea5e9' },
    { id: 'UCIMHMNwZJpYiHPIbdb1-qxA', handle: '@kipperofficial',              name: 'kipper',                                              color: '#b08968' },
    { id: 'UCHjLjF0XdxHAR7lc9Lb-0aw', handle: '@franklinandfriends',          name: 'Franklin and Friends',                                color: '#386641' },
    { id: 'UC82jKc_wW8iHVXU9GrYRunw', handle: '@moominofficial',              name: 'Moomin Official',                                     color: '#52796f' },
    { id: 'UCXLLQkbYE-G9jYrra7R4Qsw', handle: '@octonauts',                   name: 'Octonauts',                                           color: '#0284c7' },
    { id: 'UCftOIQxyjcQk5Yw_lApmFAw', handle: '@sisimpur',                    name: 'Sisimpur',                                            color: '#16a34a' },
    { id: 'UCoookXUzPciGrEZEXmh4Jjg', handle: '@sesamestreet',                name: 'Sesame Street',                                       color: '#22c55e' },
    { id: 'UCrNnk0wFBnCS1awGjq_ijGQ', handle: '@pbskids',                     name: 'PBS KIDS',                                            color: '#65a30d' },
    { id: 'UCcJT_hEkkQ03NAzp_6NEBiw', handle: '@treehousedirect',             name: 'Treehouse Direct',                                    color: '#15803d' },
    { id: 'UCL7N5wBrbp0J4vU46KWTWtQ', handle: '@morphofficial',               name: 'Morph',                                               color: '#c2410c' },
    { id: 'UCOOi7JtIMDaYsaUjDBSTSIQ', handle: '@minuscule',                   name: 'Minuscule',                                           color: '#4d7c0f' },
    { id: 'UCH6vXjt-BA7QHl0KnfL-7RQ', handle: '@simonscat',                   name: "Simon's Cat",                                         color: '#52525b' },
    { id: 'UCFeUyPY6W8qX8w2o6oSiRmw', handle: '@pinkpanther',                 name: 'Official Pink Panther',                               color: '#db2777' },
    { id: 'UCEwIUtFBhaI2L2PuKv0KL2g', handle: '@classicmrbean',               name: 'Classic Mr Bean',                                     color: '#9a3412' },
    { id: 'UCkAGrHCLFmlK3H2kd6isipg', handle: '@mrbean',                      name: 'Mr Bean',                                             color: '#b45309' },
    { id: 'UCqvXAiNyn8pd9SVPclWfJTg', handle: '@popeyeandfriendsofficial',    name: 'Popeye And Friends Official',                         color: '#1e40af' },
    { id: 'UCB2aeGGPNj7l5Z71bYNqX-Q', handle: '@woodywoodpecker',             name: 'Woody Woodpecker',                                    color: '#dc2626' }
  ];

  const CHANNEL_BY_ID = new Map(APPROVED_CHANNELS.map(c => [c.id, c]));
  const APPROVED_IDS = new Set(APPROVED_CHANNELS.map(c => c.id));
  const APPROVED_HANDLES = new Set(APPROVED_CHANNELS.map(c => c.handle.toLowerCase()));
  const APPROVED_NAMES = new Set(APPROVED_CHANNELS.map(c => normalizeName(c.name)));
  const APPROVED_NAME_PREFIXES = [
    'oddbods & arpo the robot',
    'omar & hana - islamic cartoons',
    'bluey - official channel',
    'paddington bear - official channel',
    'the fairly oddparents - official',
    'tumble leaf - official',
    "ben and holly's little kingdom"
  ];

  // ===========================================================================
  // 2. ANTI-SLOP REGEX ENGINE (Used in 'smart' mode; 'strict' blocks ALL non-45)
  // ===========================================================================
  const SLOP_PATTERNS = [
    /\b(for kids|for toddlers?|kids tv|kids show|kids club|kids channel|kids songs?|kids funny songs|kids videos?|kids cartoon|kids usa|nursery rhymes?|rhymes for|lullab(y|ies)|baby (songs?|shark|bus|tv|cartoon|rhymes?|learning|videos?|nursery)|learn colors?|learn numbers?|learn alphabet|missing numbers|numbers and shapes|montessori|activity puzzle|surprise foam|guessing game|learning & drawing|abc (songs?|phonics)|phonics|preschool|toddlers?|kindergarten|bedtime stor(y|ies)|moral stor(y|ies)|fairy tales?|cartoons?|toons?|kidz|humpty dumpty|five little|ten little|wheels on the bus|john?ny john?ny|finger family|old macdonald|twinkle twinkle|baa baa black|itsy bitsy|head shoulders knees|peekaboo|counting fun|dance songs?|go away song|bubble gum song|vacuum cleaner song|vroom vroom|pilli go|cocomelon|babybus|pinkfong|chuchu tv|looloo kids|little angel|super simple|dave and ava|super jojo|wolfoo|blippi|ms\.?\s?rachel|diana and roma|vlad and niki|like nastya|vanimani|stephi|maya and mary|funny sofia|sofia show|tim and essy|momoral|bang bang monkey|squarewheels|ready!?\s*set!?\s*learn|sealook|flying moco|timoboy|real vs\.?\s?(chocolate|real)|paw patrol|pj masks|blaze and the monster|mighty express|spidey and his amazing|gabby['’]?s dollhouse|booba|larva|talking (tom|angela|hank)|grizzy|lemmings|zig.{1,4}sharko|oggy|morphle|pocoyo|numberblocks|alphablocks|lankybox|aphmau|maizen|mikey and jj|toca boca|gacha (life|club)|baba blast|rainybow|sumi toys|gogodino|dinolings|billion surprise|super sumo|mukta cartoon)\b/i,
    /dino|d1no|dinasour|dinosour|dinazor|saurus|saurian|raptor|t-?rex|tyrannosaur(us)?|velociraptor|utahraptor|deinonychus|indominus|indoraptor|spinosaurus|giganotosaurus|carcharodontosaurus|carnotaurus|allosaurus|ceratosaurus|baryonyx|suchomimus|albertosaurus|tarbosaurus|acrocanthosaurus|therizinosaurus|dilophosaurus|compsognathus|oviraptor|troodon|triceratops|stegosaurus|ankylosaurus|pachycephalosaurus|parasaurolophus|iguanodon|diplodocus|brachiosaurus|brontosaurus|apatosaurus|argentinosaurus|titanosaur(us)?|gallimimus|hadrosaur|edmontosaurus|corythosaurus|stygimoloch|sinoceratops|styracosaurus|kentrosaurus|pterodactyl|pteranodon|pterosaur|quetzalcoatlus|dimorphodon|mosasaur(us)?|plesiosaur(us)?|elasmosaurus|liopleurodon|kronosaurus|ichthyosaur|dunkleosteus|helicoprion|megalodon|livyatan|basilosaurus|sarcosuchus|deinosuchus|purussaurus|titanoboa|dimetrodon|gorgonops(id)?|postostuchus|smilodon|saber-?tooth|woolly mammoth|megatherium|arctodus|terror bird|argentavis|meganeura|arthropleura|jurassic|cretaceous|triassic|mesozoic|paleozoic|cenozoic|prehistoric|extinct (predator|beast|monster|giant)|apex predator|apexology|kaiju|godzilla|king kong/i,
    /\b(fight(ing|s)?|battle(s)?|showdown|brawl|clash|tournament|arena|versus|attack|bite|kill|killer|destroy|smash|crush|rampage|roar|stomp|strongest|deadliest|scariest|scary|terrifying|epic fight|crazy fight|who will win|who wins|monsters?|mutants?|mutated|hybrids?|zombies?|evil|mega)\b/i,
    /\b(toys?|toyland|playset|unboxing|pretend|roleplay|surprise eggs?|color eggs?|magic eggs?|magic color|mystery box|color block|magnetic blocks?|lego technic|giant lego|lego cooking|fillet a lego|dr\.?\s?brick|mini kitchen|tiny cooking|tiny food|tiny tasties|miniature (cooking|recipe|food|kitchen|chicken)|clover mini|mina mini|minecraft cooking|minecraft one day|stop motion cooking|cooking asmr|cutting skills|fish trap|catching trap|catfish catching|fishing eel|eel fish|ah and toys|slime|squishy|kinetic sand|sand conveyor|orbeez|play-?doh|playdough|creative dough|modeling clay|clay art|nano tape|gumball|candy chaos|hot wheels|monster jam|dollhouse|vlad|niki|diana|roma|kids roma|nastya|ryan['’]?s world)\b/i,
    /\b(ai generated|ai story|ai animation|ai cartoon|caught on camera|in real life|what happens next|gone wrong|3am|prank|transformation|evolution|level 100|100 days|compilation|non-stop|satisfying|asmr|brainrot|italian brainrot|trallallero|tung tung|cappuccina|skibidi|sprunki|incredibox|monster school|huggy|wuggy|poppy playtime|rainbow friends|banban|siren head|cartoon cat|elsagate|kidshorts|ytshorts)\b|#shorts/i,
    /\b(farming\s?simulator|farming\s?zone|farmingzone64|fs\s?(19|22|25)|fs22mods|beamng(\.drive)?|b3amng|nextbng|byd bng|game viewer|gta(\s?(5|v))?|transporting|transportation|flatbed truck|mcqueen|pothole|road trap|to garage|transporter|mega ramps?|giant ramps?|colored ramps?|rainbow ramps?|colorful cars?|funny vehicles?|car crash(es)?|cars vs|pothole vs|monster trucks?|police (cars?|trucks?|vehicles?|tractor)|garbage trucks?|fire (trucks?|engines?|and rescue)|rescue trucks?|box trucks?|scania bus|man truck|ambulance|excavators?|backhoe( loader)?|bulldozers?|concrete mixers?|mixer trucks?|crane trucks?|dump trucks?|wheel loaders?|jcb|fun color)\b/i,
    /\b(motu[\s-]?patl[ui]|motu|patlu|chh?ota[\s-]?(bheem|bhim|vim)|mighty little bheem|bheem|bhim|vim|dholakpur|mighty raju|shiva|ladoo singh|vedas city|rudra|vir|robot boy|little singham|singham|golmaal\s?j(r|unior)|pakdam pakdai|rat-a-tat|roll no\.?\s?21|kris cartoon|gattu battu|keymon ache|chikoo aur bunty|bhoot bandhus|pinaki and happy|bandbudh aur budbak|inspector chingum|kicko|super speedo|chacha bhatija|selfie with bajrangi|hunny bunny|fukrey boyzzz|guru aur bhole|eena meena deeka|chh?or police|paap-o-meter|bal ganesh|little krishna|bal hanuman|krishna balram|gopal bhar|titto cartoon|abhimanyu ki alien|bittu bahanebaaz|ninja hat(t|h)?ori|doraemon|shin[\s-]?chan|sonic gang|wow\s?kidz|green gold|voot kids|sony yay|pogo|hungama|discovery kids|nick india|nickelodeon india|cosmos maya|maha cartoon|infobells|hindi kahani(ya|yan)?|bac?chon|panchatantra|akbar birbal|tenali rama|thakumar jhuli|mainan|mobil[- ]?mobilan|membersihkan|truk|beko|ho kajak|kartun|animasi|kereta api|boneka|bayi|jangan menangis|lagu anak|vaksinasi|tangkap ikan|ikan (buntal|pari|hias|laut)|kelomang|păpuși|bebeluși|dibujos animados|juguetes|camiones|carritos|para niños|desenhos|brinquedos)\b|मोटू|पतलू|छोटा भीम|शिवा|रुद्र|लड्डू|कार्टून|बच्चों|कहानी|खिलौने|डायनासोर|কার্টুন|ছড়া|টুনটুনি|ঠাকুরমার|গোপাল ভাঁড়|মটু|পাতলু|ছোটা ভীম|ডাইনোসর|খেলনা|রাক্ষস|পুলিশ গাড়ি|ವಾಣಿಮಣಿ|ಮಕ್ಕಳು|ಚಾಲೆಂಜ್|أطفال|للأطفال|رسوم متحركة|أغاني أطفال|أغاني للأطفال|أناشيد أطفال|قصص أطفال|أبطال مدينة|سيارة إسعاف|子供の歌|子どもの動画|子供向け|童謡|ベビーバス|赤ちゃん|はたらく車|しょうぼうしゃ|パトカー|ショベルカー|мультики|машинки|синий трактор|для детей|игрушки|песочнице|живой песок|диди тв/i,
    /🦖|🦕|🚒|🚓|🚑|🚜|🚛|🚚|🧸|🍭|🥚|👶|🍼|🤡|💩|🚽|👾|🦸|🧟|👹|\uD835[\uDC00-\uDFFF]/
  ];

  // ===========================================================================
  // 3. STATE & HELPERS
  // ===========================================================================
  const SESSION_MODE_KEY = 'ytbg_session_mode';
  const getMode = () => {
    try {
      const sessionOverride = sessionStorage.getItem(SESSION_MODE_KEY);
      if (sessionOverride === 'smart' || sessionOverride === 'strict' || sessionOverride === 'off') {
        return sessionOverride;
      }
    } catch (_) {}
    return GM_getValue('ytbg_mode', DEFAULT_MODE);
  };
  const getRedirectHome = () => GM_getValue('ytbg_redirect_home', DEFAULT_REDIRECT_HOME_TO_SUBS);

  function normalizeName(str) {
    return String(str || '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function isApprovedChannel({ id = '', handle = '', name = '' }) {
    if (id && APPROVED_IDS.has(id.trim())) return true;
    if (handle) {
      const cleanHandle = handle.trim().replace(/^\/+/, '').split(/[/?#]/)[0].toLowerCase();
      if (APPROVED_HANDLES.has(cleanHandle)) return true;
    }
    if (name) {
      const cleanName = normalizeName(name);
      if (APPROVED_NAMES.has(cleanName)) return true;
      for (const prefix of APPROVED_NAME_PREFIXES) {
        if (cleanName.startsWith(prefix)) return true;
      }
    }
    return false;
  }

  function parseDurationSeconds(text) {
    if (!text) return null;
    const m = text.trim().match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    return m[3] !== undefined
      ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
      : Number(m[1]) * 60 + Number(m[2]);
  }

  function matchesSlop(text) {
    for (let i = 0; i < SLOP_PATTERNS.length; i++) {
      if (SLOP_PATTERNS[i].test(text)) return true;
    }
    return false;
  }

  function relativeTimeAgo(isoDate) {
    if (!isoDate) return '';
    const diffSec = Math.max(0, Math.floor((Date.now() - Date.parse(isoDate)) / 1000));
    if (!Number.isFinite(diffSec)) return '';
    if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))} minutes ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    const days = Math.floor(diffSec / 86400);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (days < 30) {
      const w = Math.floor(days / 7);
      return `${w} week${w === 1 ? '' : 's'} ago`;
    }
    if (days < 365) {
      const mo = Math.floor(days / 30);
      return `${mo} month${mo === 1 ? '' : 's'} ago`;
    }
    const y = Math.floor(days / 365);
    return `${y} year${y === 1 ? '' : 's'} ago`;
  }

  function shuffleArray(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Pick 3–4 random videos from EACH of the 45 channels, then interleave them in balanced rounds
  function buildHomeMixPerChannel(pool) {
    const byChan = new Map();
    for (const v of pool) {
      if (!v || !v.id) continue;
      if (!byChan.has(v.channelId)) byChan.set(v.channelId, []);
      byChan.get(v.channelId).push(v);
    }

    const buckets = [];
    for (const [cid, list] of byChan.entries()) {
      const targetCount =
        HOME_MIN_PER_CHANNEL +
        Math.floor(Math.random() * (HOME_MAX_PER_CHANNEL - HOME_MIN_PER_CHANNEL + 1));
      const picked = shuffleArray(list).slice(0, targetCount);
      if (picked.length > 0) buckets.push({ cid, list: picked });
    }

    // Interleave round-by-round (reshuffling channel order each round so it feels completely natural)
    const mixed = [];
    for (let round = 0; round < HOME_MAX_PER_CHANNEL; round++) {
      const roundOrder = shuffleArray(buckets);
      for (const b of roundOrder) {
        if (b.list[round]) mixed.push(b.list[round]);
      }
    }
    return mixed;
  }

  // Round-robin balanced shuffle across all 45 channels (used for Watch page suggestions)
  function buildBalancedMix(pool, excludeVideoId = '', preferredChannelId = '') {
    const byChan = new Map();
    for (const v of pool) {
      if (!v || !v.id || v.id === excludeVideoId) continue;
      if (!byChan.has(v.channelId)) byChan.set(v.channelId, []);
      byChan.get(v.channelId).push(v);
    }

    const buckets = [];
    for (const [cid, list] of byChan.entries()) {
      buckets.push({ cid, list: shuffleArray(list) });
    }
    const shuffledBuckets = shuffleArray(buckets);

    // On a Watch page, weave 2-3 videos from the same channel gently near the top, mixed with all other 44 channels
    const mixed = [];
    if (preferredChannelId && byChan.has(preferredChannelId)) {
      const sameChan = shuffleArray(byChan.get(preferredChannelId));
      const sameTake = sameChan.slice(0, 3);
      const otherBuckets = shuffledBuckets.filter(b => b.cid !== preferredChannelId);
      let idx = 0;
      let maxLen = 0;
      for (const b of otherBuckets) if (b.list.length > maxLen) maxLen = b.list.length;
      for (let round = 0; round < maxLen; round++) {
        for (const b of otherBuckets) {
          if (b.list[round]) {
            if (sameTake.length > 0 && idx > 0 && idx % 4 === 0) {
              mixed.push(sameTake.shift());
            }
            mixed.push(b.list[round]);
            idx++;
          }
        }
      }
      while (sameTake.length) mixed.push(sameTake.shift());
      return mixed;
    }

    let maxLen = 0;
    for (const b of shuffledBuckets) if (b.list.length > maxLen) maxLen = b.list.length;
    for (let round = 0; round < maxLen; round++) {
      for (const b of shuffledBuckets) {
        if (b.list[round]) mixed.push(b.list[round]);
      }
    }
    return mixed;
  }

  // ===========================================================================
  // 4. SAME-ORIGIN YOUTUBE RSS POOL FETCHER (Zero external servers, 6h local cache)
  // ===========================================================================
  let memoryPool = null;
  let poolLoadingPromise = null;

  function loadCachedPool() {
    if (memoryPool && memoryPool.length > 0) return memoryPool;
    try {
      const saved = GM_getValue(POOL_STORAGE_KEY, null);
      if (saved && Array.isArray(saved.videos) && saved.videos.length > 0) {
        memoryPool = saved.videos;
        const fresh = (Date.now() - (saved.fetchedAt || 0)) < POOL_CACHE_TTL_MS;
        if (!fresh) fetchAllChannelFeeds(false); // Background stale-while-revalidate refresh
        return memoryPool;
      }
    } catch (_) {}
    return [];
  }

  function decodeXmlEntities(str) {
    return String(str || '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
  }

  // Pure JS Atom XML parser (zero DOMParser -> 100% immune to YouTube's TrustedHTML CSP!)
  function parseAtomEntries(xmlText, ch) {
    const items = [];
    const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    while ((m = entryRe.exec(xmlText)) !== null) {
      const block = m[1];
      const linkMatch = block.match(/<link[^>]+href="([^"]+)"/);
      const href = linkMatch ? linkMatch[1] : '';
      if (href.includes('/shorts/')) continue;

      const vidMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const id = vidMatch ? vidMatch[1].trim() : '';
      if (!id) continue;

      const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch ? decodeXmlEntities(titleMatch[1]).trim() : '';
      if (!title) continue;

      const pubMatch = block.match(/<published>([^<]+)<\/published>/);
      items.push({
        id,
        title,
        channelId: ch.id,
        channelHandle: ch.handle,
        channelName: ch.name,
        color: ch.color || '#3ea6ff',
        published: pubMatch ? pubMatch[1].trim() : ''
      });
    }
    return items;
  }

  async function httpGetText(url) {
    if (typeof GM_xmlhttpRequest === 'function') {
      const gmText = await new Promise((resolve) => {
        try {
          GM_xmlhttpRequest({
            method: 'GET',
            url,
            timeout: 10000,
            onload: (res) => resolve(res.status >= 200 && res.status < 300 ? (res.responseText || '') : ''),
            onerror: () => resolve(''),
            ontimeout: () => resolve('')
          });
        } catch (_) {
          resolve('');
        }
      });
      if (gmText) return gmText;
    }
    try {
      const r = await fetch(url, { credentials: 'omit', cache: 'default' });
      return r.ok ? await r.text() : '';
    } catch (_) {
      return '';
    }
  }

  async function fetchChannelVideosPageFallback(ch) {
    try {
      const html = await httpGetText(`https://www.youtube.com/${ch.handle}/videos`);
      if (!html) return [];
      const m = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
      if (!m) return [];
      const data = JSON.parse(m[1]);
      const items = [];
      const seen = new Set();

      function walk(node) {
        if (!node || typeof node !== 'object' || items.length >= 15) return;
        if (node.lockupViewModel && node.lockupViewModel.contentId) {
          const lm = node.lockupViewModel;
          const id = String(lm.contentId || '');
          if (id.length === 11 && !seen.has(id)) {
            const title = lm.metadata?.lockupMetadataViewModel?.title?.content || '';
            const badgeText =
              lm.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel?.text || '';
            const durSec = parseDurationSeconds(badgeText);
            if (title && (durSec === null || durSec > MAX_SHORT_SECONDS)) {
              seen.add(id);
              items.push({
                id,
                title,
                channelId: ch.id,
                channelHandle: ch.handle,
                channelName: ch.name,
                color: ch.color || '#3ea6ff',
                published: ''
              });
            }
          }
          return;
        }
        if (node.videoRenderer && node.videoRenderer.videoId) {
          const vr = node.videoRenderer;
          const id = String(vr.videoId || '');
          if (id.length === 11 && !seen.has(id)) {
            const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText || '';
            const durSec = parseDurationSeconds(vr.lengthText?.simpleText || '');
            if (title && (durSec === null || durSec > MAX_SHORT_SECONDS)) {
              seen.add(id);
              items.push({
                id,
                title,
                channelId: ch.id,
                channelHandle: ch.handle,
                channelName: ch.name,
                color: ch.color || '#3ea6ff',
                published: ''
              });
            }
          }
          return;
        }
        if (Array.isArray(node)) {
          for (const el of node) walk(el);
        } else {
          for (const k of Object.keys(node)) walk(node[k]);
        }
      }

      walk(data);
      return items;
    } catch (_) {
      return [];
    }
  }

  async function fetchSingleChannelFeed(ch) {
    try {
      const xmlText = await httpGetText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(ch.id)}`);
      const items = xmlText ? parseAtomEntries(xmlText, ch) : [];
      // If a channel's latest RSS entries were mostly Shorts (< 4 long videos), fall back to its /videos tab!
      if (items.length < HOME_MAX_PER_CHANNEL) {
        const extra = await fetchChannelVideosPageFallback(ch);
        const existingIds = new Set(items.map(v => v.id));
        for (const v of extra) {
          if (!existingIds.has(v.id)) {
            items.push(v);
            existingIds.add(v.id);
          }
        }
      }
      return items;
    } catch (_) {
      return [];
    }
  }

  async function fetchAllChannelFeeds(force = false) {
    if (poolLoadingPromise && !force) return poolLoadingPromise;
    poolLoadingPromise = (async () => {
      const collected = [];
      const batchSize = 8;
      for (let i = 0; i < APPROVED_CHANNELS.length; i += batchSize) {
        const batch = APPROVED_CHANNELS.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(fetchSingleChannelFeed));
        for (const r of results) collected.push(...r);
      }
      if (collected.length > 0) {
        memoryPool = collected;
        try {
          GM_setValue(POOL_STORAGE_KEY, { fetchedAt: Date.now(), videos: collected });
        } catch (_) {}
      }
      poolLoadingPromise = null;
      return memoryPool || [];
    })();
    return poolLoadingPromise;
  }

  async function ensurePoolReady() {
    const cached = loadCachedPool();
    if (cached.length > 0) return cached;
    return await fetchAllChannelFeeds(false);
  }

  // ===========================================================================
  // 5. STATIC CSS SHIELD + 100% NATIVE YOUTUBE CARD STYLES
  // ===========================================================================
  const BASE_CSS = `
    [data-ytbg-hide="1"] {
      display: none !important;
    }
    /* Kill End-Screen Video Walls, Creator Cards, Autoplay Countdown & Pause Overlays */
    .ytp-endscreen-content,
    .html5-endscreen,
    .ytp-ce-element,
    .ytp-autonav-endscreen-upnext-container,
    .ytp-suggestion-set,
    .ytp-pause-overlay,
    /* Kill Shorts Shelves, Tabs & Playables */
    ytd-reel-shelf-renderer,
    ytd-rich-section-renderer:has([is-shorts], a[href^="/shorts/"], a[href^="/playables"]),
    yt-shelf-view-model:has(a[href^="/shorts/"], a[href^="/playables"]),
    ytd-guide-entry-renderer:has(a[title="Shorts"]),
    ytd-mini-guide-entry-renderer[aria-label="Shorts"] {
      display: none !important;
    }

    /* Native YouTube Home / Explore Saturated Grid */
    #ytbg-home-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(305px, 1fr));
      gap: 36px 16px;
      padding: 20px 24px 32px;
      width: 100%;
      box-sizing: border-box;
      font-family: "Roboto", "Arial", sans-serif;
    }
    @media (max-width: 720px) {
      #ytbg-home-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        padding: 12px 16px 24px;
      }
    }
    .ytbg-card {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .ytbg-thumb-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 12px;
      overflow: hidden;
      background: var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08));
      transition: border-radius 0.18s ease-out;
    }
    .ytbg-card:hover .ytbg-thumb-wrap {
      border-radius: 0;
    }
    .ytbg-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .ytbg-meta {
      display: flex;
      gap: 12px;
      margin-top: 12px;
      align-items: flex-start;
    }
    .ytbg-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.02em;
      text-decoration: none;
      user-select: none;
    }
    .ytbg-text {
      min-width: 0;
      flex: 1;
    }
    .ytbg-title {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--yt-spec-text-primary, #f1f1f1);
      font-size: 1.55rem;
      line-height: 2.1rem;
      font-weight: 500;
      text-decoration: none;
      margin: 0 0 4px 0;
      word-break: break-word;
    }
    .ytbg-chan-row {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--yt-spec-text-secondary, #aaaaaa);
      font-size: 1.35rem;
      line-height: 1.8rem;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ytbg-chan-row:hover {
      color: var(--yt-spec-text-primary, #f1f1f1);
    }
    .ytbg-sub {
      color: var(--yt-spec-text-secondary, #aaaaaa);
      font-size: 1.3rem;
      line-height: 1.8rem;
    }
    #ytbg-load-more-wrap {
      display: flex;
      justify-content: center;
      padding: 8px 0 40px;
      width: 100%;
    }
    #ytbg-load-more-btn {
      background: var(--yt-spec-badge-chip-background, rgba(255,255,255,0.1));
      color: var(--yt-spec-text-primary, #f1f1f1);
      border: 1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.12));
      border-radius: 18px;
      padding: 8px 22px;
      font-size: 1.4rem;
      font-weight: 500;
      font-family: "Roboto", "Arial", sans-serif;
      cursor: pointer;
    }
    #ytbg-load-more-btn:hover {
      background: var(--yt-spec-button-chip-background-hover, rgba(255,255,255,0.2));
    }

    /* Native YouTube Watch-Page Saturated Suggestions (Adapts to 1-col Sidebar AND 2-col Below-Player Grid!) */
    #ytbg-watch-suggestions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 8px 0 24px;
      width: 100%;
      box-sizing: border-box;
      font-family: "Roboto", "Arial", sans-serif;
    }
    .ytbg-watch-card {
      display: flex;
      flex-direction: row;
      gap: 10px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .ytbg-watch-thumb-wrap {
      position: relative;
      width: 168px;
      min-width: 168px;
      aspect-ratio: 16 / 9;
      border-radius: 8px;
      overflow: hidden;
      background: var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08));
    }
    .ytbg-watch-meta {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .ytbg-watch-title {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--yt-spec-text-primary, #f1f1f1);
      font-size: 1.4rem;
      line-height: 1.9rem;
      font-weight: 500;
      text-decoration: none;
    }
    .ytbg-watch-chan {
      color: var(--yt-spec-text-secondary, #aaaaaa);
      font-size: 1.25rem;
      line-height: 1.6rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Match YouTube's 2-column grid when Watch suggestions sit below the player (narrow window) */
    @media (max-width: 1014px) {
      #ytbg-watch-suggestions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px 14px;
      }
      .ytbg-watch-card {
        flex-direction: column;
        gap: 8px;
      }
      .ytbg-watch-thumb-wrap {
        width: 100%;
        min-width: 0;
        border-radius: 12px;
      }
    }
  `;

  function injectCSS() {
    if (getMode() === 'off') return;
    const mountTarget = document.head || document.documentElement;
    if (!mountTarget) {
      document.addEventListener('DOMContentLoaded', injectCSS, { once: true });
      return;
    }
    if (typeof GM_addStyle === 'function') {
      try {
        GM_addStyle(BASE_CSS);
        return;
      } catch (_) {}
    }
    if (!document.getElementById('ytbg-base-style')) {
      const style = document.createElement('style');
      style.id = 'ytbg-base-style';
      style.textContent = BASE_CSS;
      mountTarget.appendChild(style);
    }
  }

  // ===========================================================================
  // 6. PURE DOM CARD BUILDERS (Zero innerHTML -> 100% TrustedHTML CSP-Safe!)
  // ===========================================================================
  function getInitials(name) {
    const words = String(name || 'Y').replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return (words[0] || 'Y').slice(0, 2).toUpperCase();
  }

  function createVerifiedIcon() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.style.flexShrink = '0';
    svg.style.fill = 'currentColor';
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15-4-4 1.4-1.4 2.6 2.6 6.6-6.6L18 9l-8 8z');
    svg.appendChild(path);
    return svg;
  }

  function buildHomeCard(v) {
    const card = document.createElement('div');
    card.className = 'ytbg-card';

    const thumbLink = document.createElement('a');
    thumbLink.className = 'ytbg-thumb-wrap';
    thumbLink.href = `/watch?v=${v.id}`;

    const img = document.createElement('img');
    img.className = 'ytbg-thumb';
    img.loading = 'lazy';
    img.alt = v.title;
    img.src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
    thumbLink.appendChild(img);

    const meta = document.createElement('div');
    meta.className = 'ytbg-meta';

    const avatar = document.createElement('a');
    avatar.className = 'ytbg-avatar';
    avatar.href = `/${v.channelHandle}`;
    avatar.style.backgroundColor = v.color || '#3ea6ff';
    avatar.textContent = getInitials(v.channelName);

    const textCol = document.createElement('div');
    textCol.className = 'ytbg-text';

    const titleLink = document.createElement('a');
    titleLink.className = 'ytbg-title';
    titleLink.href = `/watch?v=${v.id}`;
    titleLink.textContent = v.title;

    const chanLink = document.createElement('a');
    chanLink.className = 'ytbg-chan-row';
    chanLink.href = `/${v.channelHandle}`;
    const chanSpan = document.createElement('span');
    chanSpan.textContent = v.channelName;
    chanLink.appendChild(chanSpan);
    chanLink.appendChild(createVerifiedIcon());

    const sub = document.createElement('div');
    sub.className = 'ytbg-sub';
    sub.textContent = relativeTimeAgo(v.published);

    textCol.appendChild(titleLink);
    textCol.appendChild(chanLink);
    if (sub.textContent) textCol.appendChild(sub);

    meta.appendChild(avatar);
    meta.appendChild(textCol);

    card.appendChild(thumbLink);
    card.appendChild(meta);
    return card;
  }

  function buildWatchCard(v) {
    const card = document.createElement('a');
    card.className = 'ytbg-watch-card';
    card.href = `/watch?v=${v.id}`;

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'ytbg-watch-thumb-wrap';

    const img = document.createElement('img');
    img.className = 'ytbg-thumb';
    img.loading = 'lazy';
    img.alt = v.title;
    img.src = `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`;
    thumbWrap.appendChild(img);

    const meta = document.createElement('div');
    meta.className = 'ytbg-watch-meta';

    const title = document.createElement('div');
    title.className = 'ytbg-watch-title';
    title.textContent = v.title;

    const chan = document.createElement('div');
    chan.className = 'ytbg-watch-chan';
    chan.textContent = v.channelName;

    const age = document.createElement('div');
    age.className = 'ytbg-watch-chan';
    age.textContent = relativeTimeAgo(v.published);

    meta.appendChild(title);
    meta.appendChild(chan);
    if (age.textContent) meta.appendChild(age);

    card.appendChild(thumbWrap);
    card.appendChild(meta);
    return card;
  }

  // ===========================================================================
  // 7. HOME / EXPLORE & WATCH SIDEBAR SATURATORS
  // ===========================================================================
  let homeQueue = [];
  let homeRenderedCount = 0;
  let homeMountedUrl = '';
  let homeSaturating = false;
  let homeScrollObs = null;
  let watchMountedVid = '';
  let watchSaturating = false;

  function removeHomeSaturator() {
    if (homeScrollObs) {
      homeScrollObs.disconnect();
      homeScrollObs = null;
    }
    document.getElementById('ytbg-home-grid')?.remove();
    document.getElementById('ytbg-load-more-wrap')?.remove();
    document.querySelectorAll('[data-ytbg-native-feed-hidden="1"]').forEach(el => {
      el.removeAttribute('data-ytbg-native-feed-hidden');
      el.removeAttribute('data-ytbg-hide');
    });
    homeMountedUrl = '';
  }

  function removeWatchSaturator() {
    document.getElementById('ytbg-watch-suggestions')?.remove();
    watchMountedVid = '';
  }

  function appendMoreHomeCards(batchCount = 36) {
    const grid = document.getElementById('ytbg-home-grid');
    if (!grid) return;
    const slice = homeQueue.slice(homeRenderedCount, homeRenderedCount + batchCount);
    if (slice.length === 0) return;
    const frag = document.createDocumentFragment();
    for (const v of slice) frag.appendChild(buildHomeCard(v));
    grid.appendChild(frag);
    homeRenderedCount += slice.length;

    const btnWrap = document.getElementById('ytbg-load-more-wrap');
    if (btnWrap && homeRenderedCount >= homeQueue.length) {
      btnWrap.style.display = 'none';
      if (homeScrollObs) {
        homeScrollObs.disconnect();
        homeScrollObs = null;
      }
    }
  }

  async function saturateHomeOrExplore() {
    const path = location.pathname;
    const isStartPage = path === '/' || path === '/feed/explore';
    if (!isStartPage) {
      removeHomeSaturator();
      return;
    }

    const browse = document.querySelector('ytd-browse:not([hidden])');
    if (!browse) return;
    const host =
      browse.querySelector('ytd-two-column-browse-results-renderer #primary') ||
      browse.querySelector('#primary') ||
      browse;
    if (!host) return;

    const existingGrid = document.getElementById('ytbg-home-grid');
    if (existingGrid && homeMountedUrl === location.href && host.contains(existingGrid)) {
      return;
    }
    if (homeSaturating) return;
    homeSaturating = true;

    try {
      const pool = await ensurePoolReady();
      if (!pool || pool.length === 0) return;

      if (location.pathname !== '/' && location.pathname !== '/feed/explore') return;

      // Re-resolve live browse/host in case YouTube hydrated while fetching
      const liveBrowse = document.querySelector('ytd-browse:not([hidden])');
      if (!liveBrowse) return;
      const liveHost =
        liveBrowse.querySelector('ytd-two-column-browse-results-renderer #primary') ||
        liveBrowse.querySelector('#primary') ||
        liveBrowse;

      // Hide YouTube's sparse native feed + slop category chips on Home/Explore
      const nativeFeeds = liveBrowse.querySelectorAll('ytd-rich-grid-renderer, ytd-section-list-renderer, ytd-feed-filter-chip-bar-renderer, #chips-wrapper');
      nativeFeeds.forEach(el => {
        el.setAttribute('data-ytbg-native-feed-hidden', '1');
        el.setAttribute('data-ytbg-hide', '1');
      });

      if (homeScrollObs) {
        homeScrollObs.disconnect();
        homeScrollObs = null;
      }
      document.getElementById('ytbg-home-grid')?.remove();
      document.getElementById('ytbg-load-more-wrap')?.remove();

      // Pick 3-4 random videos from EVERY ONE of the 45 channels (~155 videos total)
      homeQueue = buildHomeMixPerChannel(pool);
      homeRenderedCount = 0;
      homeMountedUrl = location.href;

      const grid = document.createElement('div');
      grid.id = 'ytbg-home-grid';
      liveHost.insertBefore(grid, liveHost.firstChild);

      const btnWrap = document.createElement('div');
      btnWrap.id = 'ytbg-load-more-wrap';
      const btn = document.createElement('button');
      btn.id = 'ytbg-load-more-btn';
      btn.type = 'button';
      btn.textContent = 'Show more';
      btn.addEventListener('click', () => appendMoreHomeCards(36));
      btnWrap.appendChild(btn);
      grid.after(btnWrap);

      // Render 60 cards immediately (all active channels visible right away) + smooth infinite scroll for the rest
      appendMoreHomeCards(60);

      if (typeof IntersectionObserver === 'function') {
        homeScrollObs = new IntersectionObserver((entries) => {
          if (entries.some(e => e.isIntersecting)) {
            appendMoreHomeCards(36);
          }
        }, { rootMargin: '600px' });
        homeScrollObs.observe(btnWrap);
      }
    } finally {
      homeSaturating = false;
    }
  }

  async function saturateWatchSuggestions(currentVid, currentChannelId) {
    if (!currentVid) return;

    // Find the currently VISIBLE #related container (narrow below-player vs wide right-sidebar)
    const relatedCandidates = Array.from(document.querySelectorAll('ytd-watch-flexy:not([hidden]) #related, ytd-watch-grid:not([hidden]) #related'));
    const targetRelated = relatedCandidates.find(el => el.offsetParent !== null) || relatedCandidates[0];
    if (!targetRelated) return;

    const existing = document.getElementById('ytbg-watch-suggestions');
    if (existing && watchMountedVid === currentVid && targetRelated.contains(existing)) {
      return;
    }
    if (watchSaturating) return;
    watchSaturating = true;

    try {
      const pool = await ensurePoolReady();
      if (!pool || pool.length === 0) return;
      if (location.pathname !== '/watch') return;

      const urlVid = new URLSearchParams(location.search).get('v') || '';
      if (urlVid !== currentVid) return;

      const freshCandidates = Array.from(document.querySelectorAll('ytd-watch-flexy:not([hidden]) #related, ytd-watch-grid:not([hidden]) #related'));
      const liveTarget = freshCandidates.find(el => el.offsetParent !== null) || freshCandidates[0];
      if (!liveTarget) return;

      document.getElementById('ytbg-watch-suggestions')?.remove();

      const mix = buildBalancedMix(pool, currentVid, currentChannelId).slice(0, 22);
      const box = document.createElement('div');
      box.id = 'ytbg-watch-suggestions';

      const frag = document.createDocumentFragment();
      for (const v of mix) frag.appendChild(buildWatchCard(v));
      box.appendChild(frag);

      liveTarget.appendChild(box);
      watchMountedVid = currentVid;
    } finally {
      watchSaturating = false;
    }
  }

  // ===========================================================================
  // 8. CARD & WATCH-PAGE EXTRACTION (2026 YouTube DOM)
  // ===========================================================================
  const CARD_SELECTOR = [
    'ytd-rich-item-renderer',
    'ytd-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-compact-radio-renderer',
    'ytd-playlist-renderer',
    'yt-lockup-view-model'
  ].join(',');

  function extractCardInfo(card) {
    let channelId = '';
    let channelHandle = '';
    let channelName = '';

    const links = card.querySelectorAll('a[href]');
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('/shorts/')) {
        return { isShort: true, channelId: '', channelHandle: '', channelName: '', durationSec: 0, fullText: '' };
      }
      if (!channelId && href.includes('/channel/UC')) {
        const m = href.match(/\/channel\/(UC[A-Za-z0-9_-]{22})/);
        if (m) channelId = m[1];
      }
      if (!channelHandle && href.startsWith('/@')) {
        channelHandle = href;
      }
    }

    const chanEl =
      card.querySelector('ytd-channel-name #text, ytd-channel-name a') ||
      card.querySelector('yt-content-metadata-view-model .ytContentMetadataViewModelMetadataRow:first-child span') ||
      card.querySelector('yt-content-metadata-view-model span') ||
      card.querySelector('#channel-name');
    if (chanEl) channelName = chanEl.textContent.trim();

    try {
      const rawData = card.data || card.__data?.data;
      if (rawData && !channelId) {
        const str = JSON.stringify(rawData);
        const mId = str.match(/"browseId":"(UC[A-Za-z0-9_-]{22})"/);
        if (mId) channelId = mId[1];
      }
    } catch (_) {}

    const badgeEl = card.querySelector('badge-shape, #time-status #text');
    const durationSec = badgeEl ? parseDurationSeconds(badgeEl.textContent) : null;
    const fullText = card.textContent || '';

    return { isShort: false, channelId, channelHandle, channelName, durationSec, fullText };
  }

  function getActiveWatchContext() {
    const watchEl = document.querySelector('ytd-watch-flexy:not([hidden]), ytd-watch-grid:not([hidden])');
    if (!watchEl || location.pathname !== '/watch') {
      return { onWatch: false, ready: false, approved: false, isKids: false, urlVid: '', channelId: '' };
    }

    const urlVid = new URLSearchParams(location.search).get('v') || '';
    const domVid = watchEl.getAttribute('video-id') || '';
    let playerVid = '';
    let playerAuthor = '';
    try {
      const mp = document.getElementById('movie_player');
      if (mp && typeof mp.getVideoData === 'function') {
        const vd = mp.getVideoData();
        playerVid = vd?.video_id || '';
        playerAuthor = vd?.author || '';
      }
    } catch (_) {}

    const ownerLink = document.querySelector('ytd-video-owner-renderer a[href^="/@"], ytd-video-owner-renderer a[href^="/channel/"], #upload-info a[href^="/@"], #upload-info a[href^="/channel/"]');
    const ownerHref = ownerLink?.getAttribute('href') || '';
    const ownerText = (
      document.querySelector('ytd-video-owner-renderer ytd-channel-name #text')?.textContent ||
      document.querySelector('#upload-info #channel-name')?.textContent ||
      playerAuthor || ''
    ).trim();

    let channelId = '';
    if (ownerHref.includes('/channel/UC')) {
      const m = ownerHref.match(/\/channel\/(UC[A-Za-z0-9_-]{22})/);
      if (m) channelId = m[1];
    }
    const channelHandle = ownerHref.startsWith('/@') ? ownerHref : '';

    // Resolve channelId from our approved handle/name map if href was /@handle
    if (!channelId && channelHandle) {
      const cleanH = channelHandle.replace(/^\/+/, '').split(/[/?#]/)[0].toLowerCase();
      const found = APPROVED_CHANNELS.find(c => c.handle.toLowerCase() === cleanH);
      if (found) channelId = found.id;
    }

    const kidsBanner = document.querySelector('yt-carousel-title-view-model, ytd-rich-metadata-renderer');
    const isKids = !!(
      (kidsBanner && /YouTube Kids|made just for kids/i.test(kidsBanner.textContent || '')) ||
      document.querySelector('a[href*="youtubekids.com"]')
    );

    const ready = !!(
      urlVid &&
      ((domVid && domVid === urlVid) || (playerVid && playerVid === urlVid)) &&
      (channelId || channelHandle || ownerText)
    );

    const approved = isApprovedChannel({ id: channelId, handle: channelHandle, name: ownerText });
    return { onWatch: true, ready, approved, isKids, watchEl, urlVid, channelId };
  }

  function isOnApprovedChannelPage() {
    const path = location.pathname;
    if (path.startsWith('/@')) return isApprovedChannel({ handle: path });
    const idMatch = path.match(/^\/channel\/(UC[A-Za-z0-9_-]{22})/);
    if (idMatch) return isApprovedChannel({ id: idMatch[1] });
    if (path.startsWith('/c/') || path.startsWith('/user/')) {
      const chanTitle = document.querySelector('yt-page-header-renderer h1, #channel-header #text')?.textContent?.trim() || '';
      return isApprovedChannel({ name: chanTitle });
    }
    return false;
  }

  function disableAutoplayIfChecked() {
    const btn = document.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]');
    if (btn) {
      try { btn.click(); } catch (_) {}
    }
  }

  // ===========================================================================
  // 9. MAIN ENFORCEMENT ENGINE
  // ===========================================================================
  let lastRedirectTime = 0;
  function safeRedirect(targetPath) {
    const now = Date.now();
    if (now - lastRedirectTime < 1200) return;
    lastRedirectTime = now;
    location.replace('https://www.youtube.com' + targetPath);
  }

  function enforcePage() {
    const mode = getMode();
    if (mode === 'off') {
      removeHomeSaturator();
      removeWatchSaturator();
      document.querySelectorAll('[data-ytbg-hide="1"]').forEach(el => el.removeAttribute('data-ytbg-hide'));
      return;
    }

    const path = location.pathname;
    const safeLanding = getRedirectHome() ? '/feed/subscriptions' : '/';

    // 1) Never allow YouTube Shorts playback
    if (path.startsWith('/shorts/')) {
      safeRedirect(safeLanding);
      return;
    }

    // 2) Optional: route Home -> Subscriptions
    if (path === '/' && getRedirectHome()) {
      safeRedirect('/feed/subscriptions');
      return;
    }

    // 3) In STRICT mode, saturate Home / Explore starting page with all 45 balanced channels!
    if (mode === 'strict' && (path === '/' || path === '/feed/explore')) {
      saturateHomeOrExplore();
    } else {
      removeHomeSaturator();
    }

    // 4) In STRICT mode, block browsing unapproved channel pages directly
    if (mode === 'strict' && (path.startsWith('/@') || path.startsWith('/channel/'))) {
      const idMatch = path.match(/^\/channel\/(UC[A-Za-z0-9_-]{22})/);
      const ok = isApprovedChannel({
        id: idMatch ? idMatch[1] : '',
        handle: path.startsWith('/@') ? path : ''
      });
      if (!ok) {
        safeRedirect(safeLanding);
        return;
      }
    }

    // 5) Inspect Watch Page state
    const watch = getActiveWatchContext();
    let lockWatchSuggestions = false;

    if (watch.onWatch) {
      if (mode === 'strict') {
        disableAutoplayIfChecked();
        lockWatchSuggestions = true;
        if (watch.ready && !watch.approved) {
          safeRedirect(safeLanding);
          return;
        }
        saturateWatchSuggestions(watch.urlVid, watch.channelId);
      } else if (mode === 'smart') {
        if (watch.approved || watch.isKids) {
          disableAutoplayIfChecked();
          lockWatchSuggestions = true;
          saturateWatchSuggestions(watch.urlVid, watch.channelId);
        } else {
          removeWatchSaturator();
        }
      }
    } else {
      removeWatchSaturator();
    }

    // 6) Filter native YouTube video cards on screen
    const onApprovedChanPage = isOnApprovedChannelPage();
    const cards = document.querySelectorAll(CARD_SELECTOR);
    for (const card of cards) {
      if (card.tagName === 'YT-LOCKUP-VIEW-MODEL' && card.closest('ytd-rich-item-renderer')) {
        continue;
      }

      const info = extractCardInfo(card);
      let shouldHide = false;

      if (info.isShort) {
        shouldHide = true;
      } else {
        const approved = onApprovedChanPage || isApprovedChannel({
          id: info.channelId,
          handle: info.channelHandle,
          name: info.channelName
        });

        const insideWatch = !!(watch.onWatch && watch.watchEl && watch.watchEl.contains(card));

        if (mode === 'strict') {
          if (!approved) shouldHide = true;
          if (info.durationSec !== null && info.durationSec <= MAX_SHORT_SECONDS) shouldHide = true;
        } else {
          if (lockWatchSuggestions && insideWatch) {
            if (!approved) shouldHide = true;
          } else {
            if (info.durationSec !== null && info.durationSec <= MAX_SHORT_SECONDS) {
              shouldHide = true;
            } else if (!approved && matchesSlop(info.fullText)) {
              shouldHide = true;
            }
          }
        }
      }

      if (shouldHide) {
        if (card.getAttribute('data-ytbg-hide') !== '1') {
          card.setAttribute('data-ytbg-hide', '1');
        }
      } else if (card.hasAttribute('data-ytbg-hide')) {
        card.removeAttribute('data-ytbg-hide');
      }
    }
  }

  // ===========================================================================
  // 10. SECRET PIN-PROTECTED CONTROL MENU (Ctrl+Alt+Shift+G or Tampermonkey Menu)
  // ===========================================================================
  function openControlPrompt() {
    const entered = prompt('Balanced Guard PIN:');
    if (entered !== GUARD_PIN) return;

    const curMode = getMode().toUpperCase();
    const curRedir = getRedirectHome() ? 'ON' : 'OFF';
    const poolCount = loadCachedPool().length;
    const choice = prompt(
      `YouTube Balanced Guard v2.2 (45 Channels | ${poolCount} cached videos)\n` +
      `Current Mode: ${curMode} | Home -> Subscriptions: ${curRedir}\n` +
      `Session Shortcut: Ctrl + Numpad 9 (or Ctrl + Alt + Numpad 9) -> Smart Mode\n\n` +
      `Enter a number:\n` +
      `1 = SMART Mode (Shared account: blocks slop, locks & saturates cartoon suggestions)\n` +
      `2 = STRICT Mode (Default Brother Mode: 45 balanced channels ONLY + saturated Home & Watch)\n` +
      `3 = Toggle Home -> Subscriptions redirect (Currently ${curRedir})\n` +
      `4 = OFF (Temporarily disable)\n` +
      `5 = Refresh 45-channel video pool now`
    );

    if (choice === '1') {
      try { sessionStorage.removeItem(SESSION_MODE_KEY); } catch (_) {}
      GM_setValue('ytbg_mode', 'smart');
      location.reload();
    } else if (choice === '2') {
      try { sessionStorage.removeItem(SESSION_MODE_KEY); } catch (_) {}
      GM_setValue('ytbg_mode', 'strict');
      location.reload();
    } else if (choice === '3') {
      GM_setValue('ytbg_redirect_home', !getRedirectHome());
      location.reload();
    } else if (choice === '4') {
      try { sessionStorage.removeItem(SESSION_MODE_KEY); } catch (_) {}
      GM_setValue('ytbg_mode', 'off');
      location.reload();
    } else if (choice === '5') {
      GM_setValue(POOL_STORAGE_KEY, null);
      memoryPool = null;
      fetchAllChannelFeeds(true).then(() => location.reload());
    }
  }

  function toggleSessionSmartMode() {
    const cur = getMode();
    const next = cur === 'smart' ? 'strict' : 'smart';
    try {
      if (next === 'smart') {
        sessionStorage.setItem(SESSION_MODE_KEY, 'smart');
      } else {
        sessionStorage.removeItem(SESSION_MODE_KEY);
      }
    } catch (_) {}
    location.reload();
  }

  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('Balanced Guard Settings (PIN)', openControlPrompt);
    GM_registerMenuCommand('Toggle Session Smart Mode (Ctrl+Num9)', toggleSessionSmartMode);
  }

  window.addEventListener('keydown', (e) => {
    // Secret full PIN menu: Ctrl + Alt + Shift + G
    if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      e.stopPropagation();
      openControlPrompt();
      return;
    }
    // Quick session Smart Mode toggle: Ctrl + Numpad 9 (or Ctrl + Alt + Numpad 9 backup if Firefox grabs Ctrl+9 with multiple tabs)
    if (e.ctrlKey && !e.shiftKey && e.code === 'Numpad9') {
      e.preventDefault();
      e.stopPropagation();
      toggleSessionSmartMode();
    }
  }, true);

  // ===========================================================================
  // 11. LIFECYCLE HOOKS (Debounced Observer + YouTube SPA Events)
  // ===========================================================================
  injectCSS();
  // Pre-warm cache quietly if empty
  if (getMode() !== 'off') loadCachedPool();

  let timer = null;
  function scheduleEnforce() {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      enforcePage();
    }, 150);
  }

  function startObserver() {
    if (!document.body) return;
    const obs = new MutationObserver(scheduleEnforce);
    obs.observe(document.body, { childList: true, subtree: true });
    enforcePage();
  }

  window.addEventListener('yt-navigate-finish', () => {
    homeMountedUrl = '';
    watchMountedVid = '';
    scheduleEnforce();
  }, true);
  window.addEventListener('yt-page-data-updated', scheduleEnforce, true);
  window.addEventListener('popstate', scheduleEnforce, true);
  window.addEventListener('resize', () => {
    // Re-attach Watch suggestions if responsive layout moves #related between #secondary and #below
    if (location.pathname === '/watch') {
      watchMountedVid = '';
      scheduleEnforce();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  } else {
    startObserver();
  }
})();
