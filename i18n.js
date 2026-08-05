(() => {
  const LANGUAGE_KEY = 'jfk.vegasGolfLanguage.v1';
  const zh = {
    'Vegas Golf Scorecard': '拉斯维加斯高尔夫记分卡',
    'Las Vegas Rule': '拉斯维加斯规则',
    'Las Vegas Rules': '拉斯维加斯规则',
    'Show Las Vegas rules': '查看拉斯维加斯规则',
    'The core of the Las Vegas golf rule is: combine the strokes into a two digit number, then compare the two numbers.\n\nTeams: 4 players split into 2 teams.\n\nScoring: put the lower stroke count first as the tens digit. For example, Team A scores 4 and 5 = 45; Team B scores 5 and 7 = 57. Team B loses 12 points (57 - 45).\n\nUnder Par Flip: if any player makes birdie or eagle, the losing team must reverse its number from high to low, such as 57 becoming 75. The lost points jump quickly. If both teams have a player under par, no flip is used.': '高尔夫“拉斯”规则核心就是“杆数拼成两位数，比大小算差额”。\n\n组队：4人分为两队。\n\n算分：同队两人的杆数从小到大拼成两位数，少的为十位数。例如：A队打4杆和5杆=45；B队打5杆和7杆=57。B队输12分（57 - 45）。\n\n低于标准杆翻转：若有人抓鸟或抓鹰，输的那队杆数必须“从大到小”反转排列，如57变75，输分瞬间暴涨，俗称炸了。但如果两队都有人打出低于标准杆，则不翻转计分。',
    'Golf Scorecard': '高尔夫记分卡',
    'Simple Golf Scorecard': '简单高尔夫记分卡',
    'Game complete · Locked': '比赛已完成 · 已锁定',
    'Scoring in progress': '正在记分',
    'Watching live': '观看比赛',
    'No sign-in · Ready to play': '无需登录 · 即开即用',
    'Open menu': '打开菜单',
    'Share': '分享',
    'Share app': '分享APP',
    'About': '关于',
    'About Simple Golf Scorecard': '关于简单高尔夫记分卡',
    'No account or sign-in required. Simple Golf Scorecard supports Las Vegas and Wolf & Pack scoring, live match viewing, historical scorecards, and cloud synchronization across devices. Version 5.1.': '无需注册或登录，打开链接即可使用。支持拉斯和斗地主记分、实时观看比赛战况、查看历史记分卡，以及多设备云端同步。版本 5.1。',
    'No account or sign-in required. Simple Golf Scorecard supports Las Vegas and Wolf & Pack scoring, live match viewing, historical scorecards, and cloud synchronization across devices. Version 6.0.': '无需注册或登录，打开链接即可使用。支持拉斯和斗地主记分、实时观看比赛战况、查看历史记分卡，以及多设备云端同步。版本 6.0。',
    'No account or sign-in required. Simple Golf Scorecard supports Las Vegas and Wolf & Pack scoring, live match viewing, historical scorecards, and cloud synchronization across devices. Version 6.1.': '无需注册或登录，打开链接即可使用。支持拉斯和斗地主记分、实时观看比赛战况、查看历史记分卡，以及多设备云端同步。版本 6.1。',
    'No account or sign-in required. Simple Golf Scorecard supports Las Vegas and Wolf & Pack scoring, live match viewing, historical scorecards, and cloud synchronization across devices. Version 6.1.1.': '无需注册或登录，打开链接即可使用。支持拉斯和斗地主记分、实时观看比赛战况、查看历史记分卡，以及多设备云端同步。版本 6.1.1。',
    'No account or sign-in required. Simple Golf Scorecard supports Las Vegas and Wolf & Pack scoring, live match viewing, historical scorecards, and cloud synchronization across devices. Version 6.1.2.': '无需注册或登录，打开链接即可使用。支持拉斯和斗地主记分、实时观看比赛战况、查看历史记分卡，以及多设备云端同步。版本 6.1.2。',
    'No account or sign-in required. Simple Golf Scorecard supports Las Vegas and Wolf & Pack scoring, live match viewing, historical scorecards, and cloud synchronization across devices. Version 6.1.6.': '无需注册或登录，打开链接即可使用。支持拉斯和斗地主记分、实时观看比赛战况、查看历史记分卡，以及多设备云端同步。版本 6.1.6。',
    'Add to phone desktop': '添加到手机桌面',
    'Do you want to add this app to your phone desktop?': '是否要把这个应用添加到手机桌面？',
    'Use your browser menu and choose Add to Home Screen.': '请使用浏览器菜单，选择“添加到主屏幕”。',
    'Switch to Chinese': '切换到中文',
    'Switch to English': '切换到英文',
    'English/中文': '中文/English',
    'Team A': 'A队',
    'Team B': 'B队',
    'Player 1': '球员1',
    'Player 2': '球员2',
    'Player 3': '球员3',
    'Player 4': '球员4',
    'Player': '球员',
    'History player': '历史球员',
    'Handicap': '差点',
    'Hole': '洞',
    'Par': '标准杆',
    'Index': '难度',
    'Difficulty': '难度',
    'Total': '合计',
    'Home': '主页',
    'Play': '记分',
    'Leaderboard': '成绩',
    'Courses': '球场',
    'Views': '页面',
    'Local only': '仅保存在本机',
    'Edit': '编辑',
    'Edit Info': '修改信息',
    'Modify': '设置',
    'Finish': '结束',
    'Course': '球场',
    'Mode': '模式',
    'Scoring Mode': '计分模式',
    'About scoring mode': '计分模式说明',
    'About under par flip': '低于标准杆翻转说明',
    'About Wolf selection': '地主方式说明',
    'About edit code': '编辑密码说明',
    'Gross': '总杆',
    'Net': '净杆',
    'Score display': '成绩显示',
    'Show full score': '显示完整成绩',
    'Show simple score': '显示简洁成绩',
    'A Pair': 'A组合',
    'A Points': 'A输赢',
    'B Pair': 'B组合',
    'B Points': 'B输赢',
    'Recent courses': '最近球场',
    'Choose a recent course, or use the filters below for another course.': '可直接选择最近球场，或使用下方筛选选择其他球场。',
    'Under Par Flip': '低于标准杆翻转',
    'Birdie flip': '低于标准杆翻转',
    'Add Course': '添加球场',
    'Search Course': '搜索球场',
    'New Game': '新比赛',
    'Playing': '进行中',
    'History': '历史记录',
    'Main actions': '主要操作',
    'Start scoring': '开始记分',
    'Create a new round': '创建一场新比赛',
    'Watch live': '观看比赛',
    'Follow current games': '查看正在进行的战况',
    'Past scorecards': '历史记分卡',
    'Open finished rounds': '查看已完成的比赛',
    'Continue scoring or watch the live leaderboard': '继续记分或观看实时战况',
    'Review and share completed scorecards': '查看和分享已完成的记分卡',
    'Time': '时间',
    'All': '全部',
    'Last 7 days': '最近7天',
    'Last 30 days': '最近30天',
    'Time between': '时间区间',
    'From': '开始',
    'To': '结束',
    'Choose a valid date range.': '请选择有效的日期区间。',
    'This week': '本周',
    'This month': '本月',
    'Last 3 months': '最近3个月',
    'This year': '今年',
    'Last year': '去年',
    'Last 3 years': '最近3年',
    'All played courses': '全部打过的球场',
    'New Course': '新球场',
    'Edit Course': '修改球场',
    'Course name': '球场名称',
    'Course name or city': '球场名称或城市',
    'Country': '国家',
    'Region': '地区',
    'All countries': '所有国家',
    'All regions': '所有地区',
    'Edit code': '编辑密码',
    'Default mode': '默认模式',
    'Tee time': '开球时间',
    'Holes 1-9': '第1-9洞',
    'Holes 10-18': '第10-18洞',
    'Out': '前九洞',
    'In': '后九洞',
    'Course total': '球场总标准杆',
    'Difficulty values cannot repeat.': '难度不能重复。',
    'Save Course': '保存球场',
    'Save Changes': '保存修改',
    'Search': '搜索',
    'Shared': '预置球场',
    'Preset Course': '预置球场',
    'Search online database': '搜索在线数据库',
    'Course in North America': '北美球场',
    'Manual': '手动',
    'Choose a course.': '请选择球场。',
    'No courses for selected filters': '所选筛选条件下没有球场',
    'Add': '添加',
    'Use': '使用',
    'Cancel': '取消',
    'Course Search': '球场搜索',
    'Game Setup': '比赛设置',
    'Start Game': '开始比赛',
    'Select course': '选择球场',
    'Select game type': '选择玩法',
    'Select players': '选择球员',
    'Review and confirm': '检查并确认',
    '1. Select course': '1. 选择球场',
    '2. Select game type': '2. 选择玩法',
    '3. Select players': '3. 选择球员',
    '3. Players and handicaps': '3. 球员与差点',
    '4. Review and confirm': '4. 检查并确认',
    'Review': '确认',
    'Back': '上一步',
    'Next': '下一步',
    'Next game': '下一场',
    'Previous game': '上一场',
    'Game type': '比赛玩法',
    'Players': '球员',
    'Enter or select player': '输入或选择球员',
    'Show historical players': '显示历史球员',
    'Decrease handicap': '减少差点',
    'Increase handicap': '增加差点',
    'Each player can only be selected once.': '每位球员只能选择一次。',
    'Gross uses actual strokes. Net subtracts handicap strokes.': '总杆按实际杆数计分；净杆会扣除差点杆。',
    'When a player is under par, the losing team’s number may be reversed and the point difference can increase.': '球员打出低于标准杆时，落后队的数字可能翻转，分差会增大。',
    'Remember this 2-digit code. It is required to take over scoring, edit the game, or finish the round.': '请记住这两位密码；接管记分、修改比赛或结束比赛时都需要使用。',
    'Remember this 2-digit code. It is required to take over scoring, edit the game, or finish the round. Tell it to the other scorekeepers in your group.': '请记住这两位密码；接管记分、修改比赛或结束比赛时都需要使用，并请告诉同组的其他记分员。',
    'Result Rotation automatically chooses the next Wolf from each hole’s result. Fixed Wolf keeps the same player.': '输赢轮换会根据每洞结果自动选择下一洞地主；固定地主始终由同一位球员担任。',
    'Limits each Pack player’s win or loss on one hole; recorded strokes are never changed.': '只限制每位农民单洞的输赢分数，不会改变已记录的杆数。',
    'Special-score multipliers are automatic. Manual x2 or x4 adds your chosen multiplier for this hole.': '特殊杆倍率会自动计算；手动 x2 或 x4 会为本洞叠加所选倍率。',
    'More actions': '更多操作',
    'Game setup progress': '比赛设置进度',
    '{count} players': '{count}人',
    'Cap {cap}': '单洞封顶{cap}分',
    'Wolf selection': '地主方式',
    'Rotating Wolf': '输赢轮换',
    'Fixed Wolf': '固定地主',
    'Cumulative': '累计',
    'Hole complete': '本洞已完成',
    'All player scores are entered. Go to the next hole?': '所有球员杆数已录入，是否进入下一洞？',
    'Round complete': '全场已完成',
    'All player scores are entered. Finish this game?': '第18洞所有球员杆数已录入，是否结束比赛？',
    'Eagle': '老鹰',
    'Birdie': '小鸟',
    'Bogey': '柏忌',
    'Action': '操作',
    'Confirm': '确认',
    'Code': '密码',
    'OK': '确定',
    'Close': '关闭',
    'Yes': '是',
    'No': '否',
    'Notice': '提示',
    'Edit Code': '编辑密码',
    'Cloud sync Not ok': '云同步失败',
    'Cloud request timed out. Check the connection and try again.': '云端请求超时，请检查网络后重试。',
    'Cloud sync ok': '云同步成功',
    'Scoring phone': '记分设备',
    'Scoring identity': '记分身份',
    'Who am I?': '我是谁？',
    'Choose the player using this phone. This player will be shown first on this phone.': '请选择正在使用这部手机记分的球员。此后该球员会在本机始终排在最上面。',
    'Read only': '只读',
    'Not synced yet': '尚未同步',
    'Syncing...': '正在同步…',
    'Last synced {time}': '最后同步 {time}',
    'Saved': '已保存',
    'Saving': '正在保存',
    'Waiting for network': '等待网络',
    'Version protected': '版本保护已开启',
    'Version protection needs cloud upgrade': '需升级云端以开启版本保护',
    'Completed game · locked': '比赛已完成 · 已锁定',
    'Continue scoring': '继续记分',
    'Watch live': '观看战况',
    'View scorecard': '查看记分卡',
    'Share scorecard': '分享记分卡',
    'Scoring on this phone': '当前由本手机记分',
    'Scored by {device}': '当前由「{device}」记分',
    'No scoring phone': '当前没有记分设备',
    'Take over scoring': '接管记分',
    '{device} is currently scoring. Take over and make that phone read-only?': '「{device}」正在记分。是否接管并让该手机变为只读？',
    'Release scoring now? This phone will become read-only until scoring is taken over again.': '现在转交记分吗？本手机将变为只读，直到再次接管记分。',
    'Could not take over scoring': '无法接管记分',
    'Finishing game...': '正在结束比赛……',
    'Game finished and locked.': '比赛已结束并锁定。',
    'Could not finish game': '无法结束比赛',
    'The game was not finished. Check the connection and try again.': '比赛尚未结束，请检查网络连接后重试。',
    'This game changed on another phone. Latest scores were loaded.': '另一部手机已更新比赛，系统已载入最新成绩。',
    'sync': '同步',
    'sync...': '同步...',
    'Syncing...': '正在同步...',
    'Delete': '删除',
    'Custom': '自定义',
    'Preset': '预置球场',
    'Match totals': '比赛总分',
    'Hole scores': '各洞成绩',
    'Course par and index': '球场标准杆和难度',
    'Close add course': '关闭添加球场窗口',
    'Close new game': '关闭新比赛窗口',
    'Close score entry': '关闭成绩输入',
    'Score entry': '输入成绩',
    'Score Entry': '输入成绩',
    'Game': '比赛',
    'HCP {value}': '差点 {value}',
    'Strokes received this hole: {value}': '本洞让 {value} 杆',
    'Index {value}': '难度 {value}',
    'Gross scoring': '总杆计分',
    'Net scoring': '净杆计分',
    'Previous hole': '上一洞',
    'Previous': '上一洞',
    'Next hole': '下一洞',
    'Clear': '清除',
    'Decrease score': '减少杆数',
    'Increase score': '增加杆数',
    'Quick score choices': '快速选择成绩',
    'Supabase is not connected.': 'Supabase 未连接。',
    'Add your Supabase URL and anon key to supabase-config.js.': '请在 supabase-config.js 中添加 Supabase URL 和匿名密钥。',
    'Sending and loading scorecard data.': '正在发送并加载记分卡数据。',
    'Supabase is not configured.': 'Supabase 尚未配置。',
    'Saving scorecard changes.': '正在保存记分卡更改。',
    'Edit lock acquired.': '已取得编辑权限。',
    'Another phone is now editing this game.': '另一部手机正在编辑此比赛。',
    'Edit lock refreshed.': '编辑权限已刷新。',
    "what's the code?": '请输入密码',
    'Enter the 2 digit edit code for this game.': '请输入此比赛的两位数编辑密码。',
    'The edit code is not correct. Try again.': '编辑密码不正确，请重试。',
    'Edit game': '编辑比赛',
    'Enter code, then choose Yes to edit this game.': '输入密码，然后选择“是”以编辑此比赛。',
    'Finish game': '结束比赛',
    'Share game scoring card': '分享比赛记分卡',
    'Game summary': '比赛总结',
    'Game scoring card': '比赛记分卡',
    'Player totals': '球员总杆数',
    'Score result': '比分结果',
    'Gross win/loss': '总杆输赢',
    'Net win/loss': '净杆输赢',
    'Without flip': '不翻转',
    'After flip': '翻转后',
    'Extra points from flip': '比不翻转额外多出',
    'Under-par flip was enabled for this game.': '本场比赛设定了低于标准杆翻转。',
    'Under-par flip was disabled for this game.': '本场比赛未设定低于标准杆翻转。',
    'No under-par scores were recorded.': '本场比赛没有低于标准杆的成绩。',
    'No flip: both teams were under par': '两队均低于标准杆，不翻转',
    'No score was flipped': '本洞未触发比分翻转',
    'Flip setting was off': '翻转设定未开启',
    '{value} under par': '低于标准杆 {value} 杆',
    'Generating scorecard...': '正在生成记分卡...',
    'Scorecard shared.': '记分卡已分享。',
    'Sharing is unavailable. The scorecard was downloaded instead.': '无法使用分享功能，记分卡已改为下载。',
    'Could not generate the scorecard image.': '无法生成记分卡图片。',
    'Enter code, then choose Yes to finish this game.': '输入密码，然后选择“是”以结束此比赛。',
    'Save game changes': '保存比赛修改',
    'Enter code, then choose Yes to save these changes.': '输入密码，然后选择“是”以保存这些修改。',
    'Changing course will recalculate Par, Index and scores. Enter code, then choose Yes to save these changes.': '更换球场会重新计算标准杆、难度和比分。输入密码，然后选择“是”以保存这些修改。',
    'Delete game': '删除比赛',
    'Enter code, then choose Yes to delete this finished game.': '输入密码，然后选择“是”以删除此已结束的比赛。',
    'Delete course': '删除球场',
    'Enter the course edit code, then choose Yes to delete this course.': '输入球场编辑密码，然后选择“是”以删除此球场。',
    'Enter the course edit code, then choose Yes to edit this course.': '输入球场编辑密码，然后选择“是”以修改此球场。',
    'Deleting game from cloud.': '正在从云端删除比赛。',
    'Delete failed': '删除失败',
    'Could not delete this game from the cloud. Try again.': '无法从云端删除此比赛，请重试。',
    'Deleted from cloud.': '已从云端删除。',
    'No games currently playing': '当前没有进行中的比赛',
    'No finished games': '暂无已结束的比赛',
    'Link copied': '链接已复制',
    'The app link was copied to the clipboard.': '应用链接已复制到剪贴板。',
    'Enter a valid value.': '请输入有效值。',
    'Enter a course name.': '请输入球场名称。',
    'Enter a 2 digit code.': '请输入两位数密码。',
    'Enter a par from 1 to 7.': '请输入1到7之间的标准杆数。',
    'Enter a par from 1 to 10.': '请选择1到10之间的PAR。',
    'Enter unique index values from 1 to 18.': '请输入1到18且不重复的难度值。',
    'Change course': '更换球场',
    'Changing course will recalculate Par, Index and scores. Continue?': '更换球场会重新计算标准杆、难度和比分，是否继续？',
    'Search the course API, then add one to your courses.': '搜索球场 API，然后添加到常用球场。',
    'Search courses in North America, then add one to your courses.': '搜索北美球场，然后添加到常用球场。',
    'Enter a course name to add it manually.': '输入球场名称以手动添加。',
    'Search shared courses first.': '优先搜索预置球场。',
    'Search online database first.': '优先搜索在线数据库。',
    'Search OpenStreetMap / Overpass, then use a result to add a course.': '搜索 OpenStreetMap / Overpass，然后使用结果添加球场。',
    'Searching OpenStreetMap...': '正在搜索 OpenStreetMap...',
    'Enter a course name or select a country to search OpenStreetMap.': '请输入球场名称或选择国家来搜索 OpenStreetMap。',
    'OpenStreetMap search failed. Try again.': 'OpenStreetMap 搜索失败，请重试。',
    'Add your GolfCourseAPI key to supabase-config.js before searching.': '请先在 supabase-config.js 中添加 GolfCourseAPI 密钥。',
    'Searching courses...': '正在搜索球场...',
    'Enter a course name or city to search within the selected country or region.': '请输入球场名称或城市，以在所选国家或地区内搜索。',
    'Choose a course to add.': '请选择要添加的球场。',
    'No courses found.': '没有找到球场。',
    'No shared courses found.': '没有找到预置球场。',
    'No courses found in online database.': '在线数据库中没有找到球场。',
    'No courses found in GolfCourseAPI. You can add it manually.': 'GolfCourseAPI 中没有找到此球场，你可以手动添加。',
    'Add manually': '手动添加',
    'Course search failed. Try again.': '球场搜索失败，请重试。',
    'Loading course scorecard...': '正在读取球场记分卡...',
    'Could not read PAR and INDEX from this course.': '无法从此球场读取 PAR 和难度。',
    'Close course search': '关闭球场搜索窗口',
    'Par {value}': '标准杆 {value}',
    'Hole {hole}': '第{hole}洞',
    'Hole {hole} - Par {par}': '第{hole}洞 - 标准杆{par}',
    'Hole {hole} {player} score': '第{hole}洞 {player} 成绩',
    'Par {par} - {type}': '标准杆 {par} - {type}',
    'Team A ({a1}+{a2}) vs. Team B ({b1}+{b2})': 'A队（{a1}+{a2}）对 B队（{b1}+{b2}）',
    'Total score: A {a}, B {b}': '总分：A {a}，B {b}'
    ,'Game type': '比赛玩法'
    ,'Las Vegas': '拉斯'
    ,'Fight the Landlord': '斗地主'
    ,'Players': '球员人数'
    ,'3 players': '3人'
    ,'4 players': '4人'
    ,'Landlord': '地主'
    ,'Peasant': '农民'
    ,'Multiplier': '倍数'
    ,'Double x2': '加倍 x2'
    ,'Bomb x4': '炸弹 x4'
    ,'Manual x2': '手动 x2'
    ,'Manual x4': '手动 x4'
    ,'Bomb --': '炸弹 --'
    ,'Bomb x{value}': '炸弹 x{value}'
    ,'Hole result: Manual multiplier {manual} x Bomb multiplier {bomb}': '本洞战果：手动倍数 {manual} × 炸弹倍数 {bomb}'
    ,'{count} players · Cap {cap} · Tie advantage {status}': '{count}人 · 单洞封顶{cap}分 · 高差点地主平局获胜：{status}'
    ,'On': '开'
    ,'Off': '关'
    ,'Maximum points per hole': '单洞封顶分数'
    ,'Tie: higher-handicap landlord wins': '平局时高差点地主获胜'
    ,'About maximum points per hole': '关于单洞封顶分数'
    ,'About tied-hole advantage': '关于平局地主优势'
    ,'Caps each peasant\'s win or loss on one hole after doubles, bombs, or birdies. The landlord\'s maximum is this cap multiplied by the number of peasants. It limits points only, not recorded strokes.': '限制加倍、炸弹或抓鸟之后，每位农民在单洞最多赢或输的分数。地主的单洞上限等于此封顶分数乘以农民人数。它只限制得分，不限制记录的高尔夫杆数。'
    ,'Caps each Pack player\'s win or loss on one hole after multipliers. It limits points only and never limits recorded strokes.': '限制各种倍数计算后，每位农民在单洞最多赢或输的分数。它只限制输赢分数，不限制实际记录的高尔夫杆数。'
    ,'Normally, a tied hole scores zero. When enabled, if the landlord has a higher handicap than the group\'s lowest-handicap player, the tie is awarded to the landlord at the current multiplier.': '通常平局时所有人本洞得0分。启用后，如果地主差点高于本组最低差点球员，平局改判地主获胜，并按该洞当前倍数正常计分。'
    ,'Normally, a tied hole scores zero. When enabled, if the Wolf has a higher handicap than the group\'s lowest-handicap player, the tie is awarded to the Wolf at the current multiplier.': '通常平局时所有人本洞得0分。启用后，如果地主差点高于本组最低差点球员，平局改判地主获胜，并按该洞当前倍数正常计分。'
    ,'Enter all scores to settle this hole.': '输入所有球员杆数后自动结算本洞。'
    ,'Scores still needed for {count} players.': '还需录入 {count} 位球员'
    ,'This hole has been settled automatically.': '本洞已自动结算'
    ,'Hole result': '本洞战果'
    ,'Landlord {count} times': '地主 {count}次'
    ,'Peasant {count} times': '农民 {count}次'
    ,'H{hole} {score}': '{hole}洞 {score}'
    ,'Leader': '领先'
    ,'Completed': '已完成'
    ,'Settle hole': '结算本洞'
    ,'All game types': '全部玩法'
    ,'Group': '组别'
    ,'Tee color': '发球台颜色'
    ,'Golf Game Rules': '高尔夫玩法规则'
    ,'Fight the Landlord Rules': '斗地主规则'
    ,'Show Fight the Landlord rules': '查看斗地主规则'
    ,'Show golf game rules': '查看高尔夫玩法规则'
    ,'Players: 3 or 4 players. Each hole has one landlord 👲; the other players are peasants 👨‍🌾.': '3人或4人参加。每洞一名地主👲，其余球员为农民👨‍🌾。'
    ,'Gross mode uses actual strokes. Net mode allocates handicap strokes by hole. The landlord’s score is multiplied by the number of peasants and compared with the peasants’ total score.': '总杆按实际杆数计算；净杆采用差点分洞让杆。地主杆数乘以农民人数后，与所有农民的合计杆数比较。'
    ,'Recorded strokes have no maximum limit.': '球员实际杆数不设最高上限。'
    ,'Wolf selection: Rotating Wolf follows the result of each hole. Fixed Wolf stays the same for all 18 holes and cannot be changed during the round.': '地主方式：轮换地主根据每洞结果自动决定下一洞地主；固定地主在18洞内保持不变，比赛中不可更换。'
    ,'Wolf selection: Result-Based Rotation follows the result of each hole. Fixed Wolf stays the same for all 18 holes and cannot be changed during the round.': '地主方式：输赢轮换根据每洞结果自动决定下一洞地主；固定地主在18洞内保持不变，比赛中不可更换。'
    ,'The player with the lowest Gross or Net score becomes landlord on the next hole. If the best score is tied, the current landlord continues.': '总杆或净杆最低的球员成为下一洞地主；最好成绩并列时，本洞地主连庄。'
    ,'If the landlord wins, the landlord continues on the next hole. If the peasants win, the peasant with the lowest Gross or Net score becomes the next landlord. If multiple winning peasants tie, choose the player with fewer previous turns as landlord; if still tied, rotate forward from the current landlord through the player order. The landlord can still be changed manually on the next hole.': '地主获胜时，下一洞继续当地主。农民获胜时，农民中上一洞总杆或净杆最低者成为下一洞地主。多名获胜农民最低杆并列时，优先选择本场地主次数较少者；次数仍相同时，从当前地主的下一位开始，按球员顺序循环选择。进入下一洞后仍可手动点击其他球员更换地主。'
    ,'Bomb rule: Only a special score by the winning side earns a multiplier. A winning-side birdie is x2; a winning-side eagle or hole-in-one is x4. If both sides have special scores, they cancel and the hole is x1. A special score by only the losing side is also x1.': '炸弹规则：只有胜方的特殊好成绩获得倍数。胜方小鸟为x2，胜方老鹰或一杆进洞为x4。双方都有特殊好成绩时相互抵消，按x1；只有负方出现特殊好成绩时也按x1。'
    ,'Bomb rule: Only a special score by the winning side earns a multiplier. A winning-side birdie is x2; a winning-side eagle or hole-in-one is x4. Special scores cancel only when both sides have the same level. If their levels differ, the winning side uses its own special-score multiplier. A special score by only the losing side is x1.': '炸弹规则：只有胜方的特殊好成绩获得倍数。胜方小鸟为x2，胜方老鹰或一杆进洞为x4。只有双方特殊杆等级相同时才互相抵消；等级不同时，按胜方自己的特殊杆倍数计算。只有负方出现特殊好成绩时按x1。'
    ,'Special-score multipliers use gross strokes and multiply together with the manually selected x1, x2, or x4.': '特殊杆倍数按总杆判断，并与手动选择的x1、x2或x4串接相乘。'
    ,'Tap a player to change the landlord, or tap x1, x2, or x4 to change the multiplier.': '点击球员可更换地主；点击x1、x2或x4可更改倍数。'
    ,'Tap a player to change the landlord. Manual x2 and x4 can be selected; tap the selected multiplier again to return to x1. Bomb x2 or x4 is determined automatically from the winning side’s gross scores.': '点击球员可更换地主。手动可选x2或x4；再次点击已选倍数可回到x1。炸弹x2或x4根据胜方的总杆特殊成绩自动判断。'
    ,'In Rotating Wolf mode, tap a player to change the landlord. Manual x2 and x4 can be selected; tap the selected multiplier again to return to x1. Bomb x2 or x4 is determined automatically from the winning side’s gross scores.': '轮换地主模式下，点击球员可更换地主。手动可选x2或x4；再次点击已选倍数可回到x1。炸弹x2或x4根据胜方的总杆特殊成绩自动判断。'
    ,'Per-hole cap: Each peasant cannot win or lose more than the selected cap on one hole. The landlord’s limit is the cap multiplied by the number of peasants.': '单洞封顶：每位农民单洞输赢不超过所设上限；地主上限为封顶分数乘以农民人数。'
    ,'Tied hole: Normally everyone scores zero. If the higher-handicap-landlord option is enabled, an eligible landlord wins the tie at the current multiplier.': '平局：通常所有人得0分。启用高差点地主平局获胜后，符合条件的地主按当前倍数获胜。'
  };

  const en = {
    'Fight the Landlord': 'Wolf & Pack Scoring',
    'Rotating Wolf': 'Result Rotation',
    'Landlord': 'The Wolf',
    'Peasant': 'The Pack',
    'Fight the Landlord Rules': 'Wolf & Pack Scoring Rules',
    'Show Fight the Landlord rules': 'Show Wolf & Pack Scoring rules',
    'Landlord {count} times': 'The Wolf {count} times',
    'Peasant {count} times': 'The Pack {count} times',
    'Tie: higher-handicap landlord wins': 'Tie: higher-handicap Wolf wins',
    'About tied-hole advantage': 'About the Wolf tie advantage',
    'Caps each peasant\'s win or loss on one hole after doubles, bombs, or birdies. The landlord\'s maximum is this cap multiplied by the number of peasants. It limits points only, not recorded strokes.': 'Caps each Pack player\'s win or loss on one hole. The Wolf\'s maximum is this cap multiplied by the number of Pack players. It limits points only, not recorded strokes.',
    'Normally, a tied hole scores zero. When enabled, if the landlord has a higher handicap than the group\'s lowest-handicap player, the tie is awarded to the landlord at the current multiplier.': 'Normally, a tied hole scores zero. When enabled, an eligible higher-handicap Wolf wins the tie at the current multiplier.',
    'Players: 3 or 4 players. Each hole has one landlord 👲; the other players are peasants 👨‍🌾.': 'Players: 3 or 4 players. Each hole has one Wolf 👲; the other players form The Pack 👨‍🌾.',
    'Gross mode uses actual strokes. Net mode allocates handicap strokes by hole. The landlord’s score is multiplied by the number of peasants and compared with the peasants’ total score.': 'Gross mode uses actual strokes. Net mode allocates handicap strokes by hole. The Wolf’s score is multiplied by the number of Pack players and compared with The Pack’s total score.',
    'Wolf selection: Rotating Wolf follows the result of each hole. Fixed Wolf stays the same for all 18 holes and cannot be changed during the round.': 'Wolf selection: Rotating Wolf follows each hole result. Fixed Wolf stays the same for all 18 holes and cannot be changed during the round.',
    'The player with the lowest Gross or Net score becomes landlord on the next hole. If the best score is tied, the current landlord continues.': 'The player with the lowest Gross or Net score becomes The Wolf on the next hole. If the best score is tied, the current Wolf continues.',
    'If the landlord wins, the landlord continues on the next hole. If the peasants win, the peasant with the lowest Gross or Net score becomes the next landlord. If multiple winning peasants tie, choose the player with fewer previous turns as landlord; if still tied, rotate forward from the current landlord through the player order. The landlord can still be changed manually on the next hole.': 'If The Wolf wins, The Wolf continues on the next hole. If The Pack wins, the Pack player with the lowest Gross or Net score becomes the next Wolf. If multiple Pack players tie, choose the player with fewer previous turns as The Wolf; if still tied, rotate forward from the current Wolf through the player order. The Wolf can still be changed manually on the next hole.',
    'Tap a player to change the landlord, or tap x1, x2, or x4 to change the multiplier.': 'Tap a player to change The Wolf, or tap x1, x2, or x4 to change the multiplier.',
    'Tap a player to change the landlord. Manual x2 and x4 can be selected; tap the selected multiplier again to return to x1. Bomb x2 or x4 is determined automatically from the winning side’s gross scores.': 'Tap a player to change The Wolf. Manual x2 and x4 can be selected; tap the selected multiplier again to return to x1. Bomb x2 or x4 is determined automatically from the winning side’s gross scores.',
    'In Rotating Wolf mode, tap a player to change the landlord. Manual x2 and x4 can be selected; tap the selected multiplier again to return to x1. Bomb x2 or x4 is determined automatically from the winning side’s gross scores.': 'In Rotating Wolf mode, tap a player to change The Wolf. Manual x2 and x4 can be selected; tap the selected multiplier again to return to x1. Bomb x2 or x4 is determined automatically from the winning side’s gross scores.',
    'Per-hole cap: Each peasant cannot win or lose more than the selected cap on one hole. The landlord’s limit is the cap multiplied by the number of peasants.': 'Per-hole cap: Each Pack player cannot win or lose more than the selected cap. The Wolf’s limit is the cap multiplied by the number of Pack players.',
    'Tied hole: Normally everyone scores zero. If the higher-handicap-landlord option is enabled, an eligible landlord wins the tie at the current multiplier.': 'Tied hole: Normally everyone scores zero. If the higher-handicap-Wolf option is enabled, an eligible Wolf wins the tie at the current multiplier.'
  };

  let language = localStorage.getItem(LANGUAGE_KEY) === 'zh-CN' ? 'zh-CN' : 'en';

  function t(text, values = {}) {
    let result = language === 'zh-CN' ? (zh[text] || text) : (en[text] || text);
    Object.entries(values).forEach(([key, value]) => {
      result = result.replaceAll(`{${key}}`, String(value));
    });
    return result;
  }

  function applyStatic() {
    document.documentElement.lang = language;
    document.title = t('Simple Golf Scorecard');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (node.parentElement?.closest('[data-bilingual]')) return;
      const value = node.nodeValue;
      const trimmed = value.trim();
      if (!trimmed || !(trimmed in zh)) return;
      node.nodeValue = value.replace(trimmed, t(trimmed));
    });
    document.querySelectorAll('[aria-label], [title], [placeholder]').forEach(element => {
      ['aria-label', 'title', 'placeholder'].forEach(attribute => {
        const value = element.getAttribute(attribute);
        if (value && value in zh) element.setAttribute(attribute, t(value));
      });
    });
    document.querySelectorAll('#languageButton, #welcomeLanguageButton').forEach(button => {
      const target = language === 'en' ? t('Switch to Chinese') : t('Switch to English');
      button.innerHTML = '<span aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg></span>';
      button.setAttribute('aria-label', target);
      button.title = target;
    });
  }

  function toggle() {
    localStorage.setItem(LANGUAGE_KEY, language === 'en' ? 'zh-CN' : 'en');
    window.location.reload();
  }

  window.VEGAS_I18N = { applyStatic, get language() { return language; }, t, toggle };
  applyStatic();
})();
