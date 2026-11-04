import type { Question } from "../types";

// バッチA: 基礎概念・現金過不足・預金と小口現金・帳簿と伝票（独自作成、2027年度出題区分表対応）
export const QUESTIONS_A: Question[] = [
  {
    "id": "A001",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-1",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "個人商店を開業するにあたり、店主が現金500,000円を元入れした。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金",
        "amount": 500000
      },
      {
        "side": "credit",
        "account": "資本金",
        "amount": 500000
      }
    ],
    "explanation": "事業に持ち込んだ現金は資産の増加として借方に記録し、その出所は純資産である資本金の増加として貸方に記録する。",
    "hints": [
      "着眼点：現金が増えた理由が、売上ではなく事業主の出資である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金",
      "資本金"
    ],
    "terms": [
      "元入れ",
      "資本金",
      "資産",
      "純資産"
    ],
    "lessonId": "L01",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A002",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-2",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "現金200,000円を普通預金口座に預け入れた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "普通預金",
        "amount": 200000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 200000
      }
    ],
    "explanation": "手元の現金が減り、普通預金が同額増える資産同士の振替である。収益や費用は発生しない。",
    "hints": [
      "着眼点：現金と預金のどちらが増え、どちらが減ったかを比べる。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "普通預金",
      "現金"
    ],
    "terms": [
      "資産の振替",
      "普通預金"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A003",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-2",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "商品80,000円を現金で仕入れた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "仕入",
        "amount": 80000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 80000
      }
    ],
    "explanation": "商品の仕入は費用である仕入の増加として借方に、現金の減少は貸方に記録する。",
    "hints": [
      "着眼点：買ったものが商品（販売目的）である点と、代金を現金で払った点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "仕入",
      "現金"
    ],
    "terms": [
      "仕入",
      "費用"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A004",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-2",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "商品を120,000円で販売し、代金は現金で受け取った。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金",
        "amount": 120000
      },
      {
        "side": "credit",
        "account": "売上",
        "amount": 120000
      }
    ],
    "explanation": "現金の増加を借方に、商品販売による収益である売上の発生を貸方に記録する。",
    "hints": [
      "着眼点：現金を受け取ったことと、収益が発生したことを分けて考える。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金",
      "売上"
    ],
    "terms": [
      "売上",
      "収益"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A005",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-3",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "従業員への給料150,000円を現金で支払った。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "給料",
        "amount": 150000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 150000
      }
    ],
    "explanation": "給料は費用の発生として借方に、現金の減少を貸方に記録する。",
    "hints": [
      "着眼点：支払いの内容が人件費である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "給料",
      "現金"
    ],
    "terms": [
      "給料",
      "費用"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A006",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-3",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "事務用の備品60,000円を購入し、代金は現金で支払った。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "備品",
        "amount": 60000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 60000
      }
    ],
    "explanation": "備品は長く使う資産なので、購入時は費用ではなく備品（資産）の増加として借方に記録し、現金の減少を貸方に記録する。",
    "hints": [
      "着眼点：買ったものがその期で使い切る消耗品か、長く使う備品かを見分ける。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "備品",
      "現金"
    ],
    "terms": [
      "備品",
      "固定資産"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A007",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-3",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "銀行から現金300,000円を借り入れた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金",
        "amount": 300000
      },
      {
        "side": "credit",
        "account": "借入金",
        "amount": 300000
      }
    ],
    "explanation": "現金の増加を借方に、返済義務である借入金（負債）の増加を貸方に記録する。借入は収益ではない。",
    "hints": [
      "着眼点：受け取った現金に返済義務があるかどうかを考える。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金",
      "借入金"
    ],
    "terms": [
      "借入金",
      "負債"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A008",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-3",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "銀行借入金の元本100,000円を現金で返済した。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "借入金",
        "amount": 100000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 100000
      }
    ],
    "explanation": "返済により負債である借入金が減少するので借方に、現金の減少を貸方に記録する。元本の返済は費用ではない。",
    "hints": [
      "着眼点：減るのが負債なのか費用なのかを区別する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "借入金",
      "現金"
    ],
    "terms": [
      "元本返済",
      "負債の減少"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A009",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-2",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "得意先に対する売掛金45,000円を現金で回収した。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金",
        "amount": 45000
      },
      {
        "side": "credit",
        "account": "売掛金",
        "amount": 45000
      }
    ],
    "explanation": "現金の増加を借方に、債権である売掛金の減少を貸方に記録する。回収の時点で新たな売上は発生しない。",
    "hints": [
      "着眼点：すでに計上済みの債権が現金に変わる取引である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金",
      "売掛金"
    ],
    "terms": [
      "売掛金",
      "回収"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A010",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-2",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "商品100,000円を仕入れ、代金のうち30,000円は現金で支払い、残額は掛けとした。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "仕入",
        "amount": 100000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 30000
      },
      {
        "side": "credit",
        "account": "買掛金",
        "amount": 70000
      }
    ],
    "explanation": "仕入100,000円のうち現金支払分が30,000円なので、掛けとなる買掛金は100,000円から30,000円を差し引いた70,000円である。",
    "hints": [
      "着眼点：仕入代金の支払方法が現金と掛けに分かれている点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "仕入",
      "現金",
      "買掛金"
    ],
    "terms": [
      "買掛金",
      "掛け仕入"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 1,
    "calcProcess": "買掛金 = 100,000 - 30,000 = 70,000"
  },
  {
    "id": "A011",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-2",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "商品150,000円を販売し、代金のうち40,000円は現金で受け取り、残額は掛けとした。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金",
        "amount": 40000
      },
      {
        "side": "debit",
        "account": "売掛金",
        "amount": 110000
      },
      {
        "side": "credit",
        "account": "売上",
        "amount": 150000
      }
    ],
    "explanation": "売上150,000円のうち現金で受け取った40,000円を除く110,000円が売掛金となる。収益である売上は販売額の全額を計上する。",
    "hints": [
      "着眼点：売上の全額と、受取手段ごとの内訳を分けて考える。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金",
      "売掛金",
      "売上"
    ],
    "terms": [
      "売掛金",
      "掛け売上"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 1,
    "calcProcess": "売掛金 = 150,000 - 40,000 = 110,000"
  },
  {
    "id": "A012",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "1-3",
    "syllabus": "第一・簿記の基礎",
    "difficulty": "advanced",
    "needsCalc": false,
    "prompt": "現金100,000円を支払い、備品90,000円とコピー用紙などの消耗品10,000円をあわせて購入した。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "備品",
        "amount": 90000
      },
      {
        "side": "debit",
        "account": "消耗品費",
        "amount": 10000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 100000
      }
    ],
    "explanation": "長く使う備品は資産として90,000円、使い切る消耗品は消耗品費として10,000円を借方に分け、現金の減少100,000円を貸方に記録する。",
    "hints": [
      "着眼点：1回の支払いの中に、資産になるものと費用になるものが混ざっている点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "備品",
      "消耗品費",
      "現金"
    ],
    "terms": [
      "備品",
      "消耗品費",
      "複合取引"
    ],
    "lessonId": "L02",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A013",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "basic",
    "needsCalc": true,
    "prompt": "現金の実際有高を数えたところ82,000円であったが、現金勘定の帳簿残高は85,000円であった。差額の原因は不明である。この時点の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金過不足",
        "amount": 3000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 3000
      }
    ],
    "explanation": "実際有高が帳簿残高より3,000円少ないので、現金を実際有高に合わせるため現金を3,000円減らし、差額を現金過不足に振り替える。",
    "hints": [
      "着眼点：帳簿残高と実際有高のどちらが大きいかをまず比べる。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金過不足",
      "現金"
    ],
    "terms": [
      "現金過不足",
      "実際有高"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 1,
    "calcProcess": "差額 = 85,000 - 82,000 = 3,000"
  },
  {
    "id": "A014",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "basic",
    "needsCalc": true,
    "prompt": "現金の実際有高は45,500円であったが、現金勘定の帳簿残高は42,000円であった。差額の原因は不明である。この時点の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金",
        "amount": 3500
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 3500
      }
    ],
    "explanation": "実際有高が帳簿残高より3,500円多いので、現金を実際有高に合わせるため現金を3,500円増やし、差額を現金過不足に振り替える。",
    "hints": [
      "着眼点：実際有高が帳簿より多い場合、現金勘定を増やす方向になる点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金",
      "現金過不足"
    ],
    "terms": [
      "現金過不足",
      "実際有高"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 1,
    "calcProcess": "差額 = 45,500 - 42,000 = 3,500"
  },
  {
    "id": "A015",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "現金過不足勘定の借方残高4,000円について、決算を迎えても原因は判明しなかった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "雑損",
        "amount": 4000
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 4000
      }
    ],
    "explanation": "不足の原因が決算まで不明なまま残った現金過不足（借方残高）は、雑損に振り替えて現金過不足勘定を閉じる。",
    "hints": [
      "着眼点：現金過不足が借方残高であること、つまり不足側の差額である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "雑損",
      "現金過不足"
    ],
    "terms": [
      "雑損",
      "決算振替"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A016",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "現金過不足勘定の貸方残高2,800円について、決算を迎えても原因は判明しなかった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金過不足",
        "amount": 2800
      },
      {
        "side": "credit",
        "account": "雑益",
        "amount": 2800
      }
    ],
    "explanation": "過剰の原因が決算まで不明なまま残った現金過不足（貸方残高）は、雑益に振り替えて現金過不足勘定を閉じる。",
    "hints": [
      "着眼点：現金過不足が貸方残高であること、つまり過剰側の差額である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金過不足",
      "雑益"
    ],
    "terms": [
      "雑益",
      "決算振替"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A017",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "現金過不足勘定の借方残高5,000円は、消耗品購入代金5,000円の支払いが未記帳であったためと判明した。判明した時点の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "消耗品費",
        "amount": 5000
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 5000
      }
    ],
    "explanation": "現金で払ったのに記帳していなかった消耗品費を計上し、仮の勘定である現金過不足を取り消す。",
    "hints": [
      "着眼点：差額の原因となった取引の内容（何を買ったか）に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "消耗品費",
      "現金過不足"
    ],
    "terms": [
      "未記帳",
      "消耗品費"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A018",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "現金過不足勘定の貸方残高6,000円は、貸付金利息6,000円の受取りが未記帳であったためと判明した。判明した時点の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金過不足",
        "amount": 6000
      },
      {
        "side": "credit",
        "account": "受取利息",
        "amount": 6000
      }
    ],
    "explanation": "現金を受け取ったのに記帳していなかった受取利息を計上し、現金過不足を取り消す。",
    "hints": [
      "着眼点：差額の原因となった取引の内容（何の受取りか）に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金過不足",
      "受取利息"
    ],
    "terms": [
      "未記帳",
      "受取利息"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A019",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金過不足勘定の借方残高8,000円について、うち3,000円は消耗品購入代金の未記帳と判明したが、残額は決算を迎えても不明であった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "消耗品費",
        "amount": 3000
      },
      {
        "side": "debit",
        "account": "雑損",
        "amount": 5000
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 8000
      }
    ],
    "explanation": "判明した3,000円は消耗品費に振り替え、残りの不明分5,000円は雑損に振り替える。合計8,000円で現金過不足の借方残高が全額消える。",
    "hints": [
      "着眼点：差額を、原因が分かった部分と分からない部分に分ける。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "消耗品費",
      "雑損",
      "現金過不足"
    ],
    "terms": [
      "現金過不足",
      "雑損"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "不明分 = 8,000 - 3,000 = 5,000"
  },
  {
    "id": "A020",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金過不足勘定の貸方残高9,000円について、うち4,000円は受取利息の未記帳と判明したが、残額は決算を迎えても不明であった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金過不足",
        "amount": 9000
      },
      {
        "side": "credit",
        "account": "受取利息",
        "amount": 4000
      },
      {
        "side": "credit",
        "account": "雑益",
        "amount": 5000
      }
    ],
    "explanation": "判明した4,000円は受取利息に振り替え、残りの不明分5,000円は雑益に振り替える。合計9,000円で現金過不足の貸方残高が全額消える。",
    "hints": [
      "着眼点：差額を、原因が分かった部分と分からない部分に分ける。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金過不足",
      "受取利息",
      "雑益"
    ],
    "terms": [
      "現金過不足",
      "雑益"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "不明分 = 9,000 - 4,000 = 5,000"
  },
  {
    "id": "A021",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金過不足勘定の貸方残高7,500円について、うち2,000円は旅費交通費を実際より多く記帳していたためと判明したが、残額は決算を迎えても不明であった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金過不足",
        "amount": 7500
      },
      {
        "side": "credit",
        "account": "旅費交通費",
        "amount": 2000
      },
      {
        "side": "credit",
        "account": "雑益",
        "amount": 5500
      }
    ],
    "explanation": "旅費交通費の過大計上2,000円は費用を取り消す方向で振り替え、残りの不明分5,500円は雑益に振り替える。",
    "hints": [
      "着眼点：過大計上は未記帳と逆向きの誤りである点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金過不足",
      "旅費交通費",
      "雑益"
    ],
    "terms": [
      "過大計上",
      "旅費交通費"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "不明分 = 7,500 - 2,000 = 5,500"
  },
  {
    "id": "A022",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金過不足勘定の借方残高15,000円について、うち12,000円は給料支払いの未記帳と判明したが、残額は決算を迎えても不明であった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "給料",
        "amount": 12000
      },
      {
        "side": "debit",
        "account": "雑損",
        "amount": 3000
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 15000
      }
    ],
    "explanation": "判明した12,000円は給料に振り替え、残りの不明分3,000円は雑損に振り替える。",
    "hints": [
      "着眼点：差額の大部分が未記帳の支払いである点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "給料",
      "雑損",
      "現金過不足"
    ],
    "terms": [
      "未記帳",
      "給料"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "不明分 = 15,000 - 12,000 = 3,000"
  },
  {
    "id": "A023",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金過不足勘定の借方残高4,000円について、うち1,800円は通信費支払いの未記帳と判明したが、残額は決算を迎えても不明であった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "通信費",
        "amount": 1800
      },
      {
        "side": "debit",
        "account": "雑損",
        "amount": 2200
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 4000
      }
    ],
    "explanation": "判明した1,800円は通信費に振り替え、残りの不明分2,200円は雑損に振り替える。",
    "hints": [
      "着眼点：判明分と不明分の金額配分を先に確定させる。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "通信費",
      "雑損",
      "現金過不足"
    ],
    "terms": [
      "未記帳",
      "通信費"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "不明分 = 4,000 - 1,800 = 2,200"
  },
  {
    "id": "A024",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金過不足勘定の貸方残高13,000円について、うち10,000円は現金売上の未記帳と判明したが、残額は決算を迎えても不明であった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金過不足",
        "amount": 13000
      },
      {
        "side": "credit",
        "account": "売上",
        "amount": 10000
      },
      {
        "side": "credit",
        "account": "雑益",
        "amount": 3000
      }
    ],
    "explanation": "判明した10,000円は売上に振り替え、残りの不明分3,000円は雑益に振り替える。現金勘定は実際有高に調整済みなので動かさない。",
    "hints": [
      "着眼点：原因が収益の未記帳である点と、現金を再度動かさない点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金過不足",
      "売上",
      "雑益"
    ],
    "terms": [
      "未記帳",
      "売上"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "不明分 = 13,000 - 10,000 = 3,000"
  },
  {
    "id": "A025",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": true,
    "prompt": "現金の実際有高は121,900円であったが、現金勘定の帳簿残高は123,400円であった。差額の原因は不明である。この時点の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金過不足",
        "amount": 1500
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 1500
      }
    ],
    "explanation": "実際有高が帳簿残高より1,500円少ないので、現金を1,500円減らして実際有高に合わせ、差額を現金過不足に振り替える。",
    "hints": [
      "着眼点：金額が大きくても、比べるのは帳簿残高と実際有高の差だけである点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金過不足",
      "現金"
    ],
    "terms": [
      "現金過不足",
      "実際有高"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 1,
    "calcProcess": "差額 = 123,400 - 121,900 = 1,500"
  },
  {
    "id": "A026",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": true,
    "prompt": "現金の実際有高は68,000円であったが、現金勘定の帳簿残高は67,200円であった。差額の原因は不明である。この時点の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金",
        "amount": 800
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 800
      }
    ],
    "explanation": "実際有高が帳簿残高より800円多いので、現金を800円増やして実際有高に合わせ、差額を現金過不足に振り替える。",
    "hints": [
      "着眼点：差額が小さい場合でも処理の向きは金額の大小で変わらない点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金",
      "現金過不足"
    ],
    "terms": [
      "現金過不足",
      "実際有高"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 1,
    "calcProcess": "差額 = 68,000 - 67,200 = 800"
  },
  {
    "id": "A027",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金過不足勘定の借方残高9,000円について、うち6,500円は商品の現金仕入が未記帳であったためと判明したが、残額は決算を迎えても不明であった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "仕入",
        "amount": 6500
      },
      {
        "side": "debit",
        "account": "雑損",
        "amount": 2500
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 9000
      }
    ],
    "explanation": "判明した6,500円は仕入に振り替え、残りの不明分2,500円は雑損に振り替える。",
    "hints": [
      "着眼点：未記帳だったのが商品の仕入である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "仕入",
      "雑損",
      "現金過不足"
    ],
    "terms": [
      "未記帳",
      "仕入"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "不明分 = 9,000 - 6,500 = 2,500"
  },
  {
    "id": "A028",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": false,
    "prompt": "現金過不足勘定の貸方残高5,600円の全額が、従業員が立て替えていた交通費の精算金5,600円の受取りを立替金の戻しとして記帳していなかったためと判明した。判明した時点の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金過不足",
        "amount": 5600
      },
      {
        "side": "credit",
        "account": "立替金",
        "amount": 5600
      }
    ],
    "explanation": "受け取った現金は立替金の回収であり収益ではないため、立替金の減少として振り替え、現金過不足を取り消す。",
    "hints": [
      "着眼点：受け取ったお金が収益なのか、立て替えたお金の戻りなのかを区別する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金過不足",
      "立替金"
    ],
    "terms": [
      "立替金",
      "未記帳"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A029",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "現金過不足勘定の借方残高2,400円の全額が、出張旅費2,400円の現金支払いが未記帳であったためと判明した。判明した時点の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "旅費交通費",
        "amount": 2400
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 2400
      }
    ],
    "explanation": "現金で払ったのに記帳していなかった旅費交通費を計上し、現金過不足を取り消す。",
    "hints": [
      "着眼点：差額の原因となった支払いの内容に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "旅費交通費",
      "現金過不足"
    ],
    "terms": [
      "未記帳",
      "旅費交通費"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A030",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金過不足勘定の借方残高6,000円について、消耗品購入代金の未記帳2,000円と旅費交通費支払いの未記帳3,000円が判明したが、残額は決算を迎えても不明であった。決算時の振替仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "消耗品費",
        "amount": 2000
      },
      {
        "side": "debit",
        "account": "旅費交通費",
        "amount": 3000
      },
      {
        "side": "debit",
        "account": "雑損",
        "amount": 1000
      },
      {
        "side": "credit",
        "account": "現金過不足",
        "amount": 6000
      }
    ],
    "explanation": "判明した消耗品費2,000円と旅費交通費3,000円をそれぞれ振り替え、残りの不明分1,000円は雑損に振り替える。",
    "hints": [
      "着眼点：原因が2種類判明している点と、残額の扱いを切り分ける。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "消耗品費",
      "旅費交通費",
      "雑損",
      "現金過不足"
    ],
    "terms": [
      "現金過不足",
      "雑損"
    ],
    "lessonId": "L04",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 3,
    "calcProcess": "不明分 = 6,000 - 2,000 - 3,000 = 1,000"
  },
  {
    "id": "A031",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "現金150,000円を普通預金口座に預け入れた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "普通預金",
        "amount": 150000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 150000
      }
    ],
    "explanation": "現金が減り普通預金が増える資産同士の振替である。",
    "hints": [
      "着眼点：預け先が普通預金である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "普通預金",
      "現金"
    ],
    "terms": [
      "普通預金",
      "預入"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A032",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "普通預金口座から現金80,000円を引き出した。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "現金",
        "amount": 80000
      },
      {
        "side": "credit",
        "account": "普通預金",
        "amount": 80000
      }
    ],
    "explanation": "現金が増え普通預金が減る資産同士の振替である。引出しは費用ではない。",
    "hints": [
      "着眼点：預入と引出で仕訳の向きが逆になる点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "現金",
      "普通預金"
    ],
    "terms": [
      "普通預金",
      "引出"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A033",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "現金200,000円を当座預金口座に預け入れた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "当座預金",
        "amount": 200000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 200000
      }
    ],
    "explanation": "現金が減り当座預金が増える資産同士の振替である。",
    "hints": [
      "着眼点：預け先が当座預金である点を、普通預金の場合と区別する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "当座預金",
      "現金"
    ],
    "terms": [
      "当座預金",
      "預入"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A034",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "仕入先に対する買掛金95,000円を、普通預金口座から振り込んで支払った。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "買掛金",
        "amount": 95000
      },
      {
        "side": "credit",
        "account": "普通預金",
        "amount": 95000
      }
    ],
    "explanation": "買掛金の減少を借方に、普通預金の減少を貸方に記録する。支払手段が預金でも買掛金の処理は変わらない。",
    "hints": [
      "着眼点：減るのが現金ではなく普通預金である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "買掛金",
      "普通預金"
    ],
    "terms": [
      "買掛金",
      "振込"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A035",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "得意先に対する売掛金68,000円が、普通預金口座に振り込まれて回収された。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "普通預金",
        "amount": 68000
      },
      {
        "side": "credit",
        "account": "売掛金",
        "amount": 68000
      }
    ],
    "explanation": "普通預金の増加を借方に、売掛金の減少を貸方に記録する。",
    "hints": [
      "着眼点：回収手段が現金ではなく預金振込である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "普通預金",
      "売掛金"
    ],
    "terms": [
      "売掛金",
      "振込回収"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A036",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "普通預金口座から当座預金口座へ120,000円を振り替えた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "当座預金",
        "amount": 120000
      },
      {
        "side": "credit",
        "account": "普通預金",
        "amount": 120000
      }
    ],
    "explanation": "当座預金が増え普通預金が減る、預金口座同士の振替である。収益・費用は発生しない。",
    "hints": [
      "着眼点：振替元と振替先の口座を正しく対応させる。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "当座預金",
      "普通預金"
    ],
    "terms": [
      "口座振替",
      "預金"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A037",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "店舗の家賃55,000円が当座預金口座から引き落とされた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "支払家賃",
        "amount": 55000
      },
      {
        "side": "credit",
        "account": "当座預金",
        "amount": 55000
      }
    ],
    "explanation": "支払家賃（費用）の発生を借方に、当座預金の減少を貸方に記録する。",
    "hints": [
      "着眼点：引落しの内容が家賃である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "支払家賃",
      "当座預金"
    ],
    "terms": [
      "支払家賃",
      "自動引落"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A038",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "買掛金50,000円を当座預金口座から支払ったが、支払前の当座預金残高は30,000円であり、不足分は当座借越契約により自動的に借り入れた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "買掛金",
        "amount": 50000
      },
      {
        "side": "credit",
        "account": "当座預金",
        "amount": 30000
      },
      {
        "side": "credit",
        "account": "当座借越",
        "amount": 20000
      }
    ],
    "explanation": "支払額50,000円のうち預金残高でまかなえる30,000円は当座預金の減少とし、不足する20,000円は当座借越（負債）の増加とする。",
    "hints": [
      "着眼点：支払額を預金で払える部分と借越になる部分に分ける。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "買掛金",
      "当座預金",
      "当座借越"
    ],
    "terms": [
      "当座借越",
      "二勘定制"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "当座借越 = 50,000 - 30,000 = 20,000"
  },
  {
    "id": "A039",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "水道光熱費18,000円を当座預金口座から支払ったが、支払前の当座預金残高は10,000円であり、不足分は当座借越契約により自動的に借り入れた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "水道光熱費",
        "amount": 18000
      },
      {
        "side": "credit",
        "account": "当座預金",
        "amount": 10000
      },
      {
        "side": "credit",
        "account": "当座借越",
        "amount": 8000
      }
    ],
    "explanation": "支払額18,000円のうち10,000円は当座預金の減少とし、不足する8,000円は当座借越の増加とする。",
    "hints": [
      "着眼点：費用の支払いに借越が組み合わさっている点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "水道光熱費",
      "当座預金",
      "当座借越"
    ],
    "terms": [
      "当座借越",
      "水道光熱費"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "当座借越 = 18,000 - 10,000 = 8,000"
  },
  {
    "id": "A040",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "当座借越の残高が25,000円ある当座預金口座に、現金60,000円を預け入れた。二勘定制による仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "当座借越",
        "amount": 25000
      },
      {
        "side": "debit",
        "account": "当座預金",
        "amount": 35000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 60000
      }
    ],
    "explanation": "預入金60,000円はまず当座借越25,000円の返済に充てられ、残りの35,000円が当座預金残高となる。",
    "hints": [
      "着眼点：預入金が借越の返済と預金残高の形成に分かれる点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "当座借越",
      "当座預金",
      "現金"
    ],
    "terms": [
      "当座借越",
      "返済",
      "二勘定制"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "当座預金 = 60,000 - 25,000 = 35,000"
  },
  {
    "id": "A041",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "当座借越15,000円を返済するため、同額を当座預金口座に入金して借越を解消した。借越解消の仕訳として、当座借越15,000円の減少を記録しなさい。相手科目は現金とする。",
    "journal": [
      {
        "side": "debit",
        "account": "当座借越",
        "amount": 15000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 15000
      }
    ],
    "explanation": "返済により負債である当座借越が減少するので借方に、現金の減少を貸方に記録する。",
    "hints": [
      "着眼点：減るのが負債である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "当座借越",
      "現金"
    ],
    "terms": [
      "当座借越",
      "返済"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A042",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "小口現金として、用度係に現金50,000円を前渡しした。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "小口現金",
        "amount": 50000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 50000
      }
    ],
    "explanation": "前渡しにより小口現金（資産）が増え、手元の現金が減る。前渡しの時点では費用はまだ発生していない。",
    "hints": [
      "着眼点：前渡しの時点では、まだ何も買っていない点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "小口現金",
      "現金"
    ],
    "terms": [
      "小口現金",
      "前渡し",
      "インプレスト・システム"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A043",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "用度係から小口現金の支払報告を受けた。内訳は旅費交通費12,000円、消耗品費8,000円、通信費5,000円であり、同額を現金で補給した（定額資金前渡制度）。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "旅費交通費",
        "amount": 12000
      },
      {
        "side": "debit",
        "account": "消耗品費",
        "amount": 8000
      },
      {
        "side": "debit",
        "account": "通信費",
        "amount": 5000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 25000
      }
    ],
    "explanation": "補給時は使った費用をそれぞれ計上し、合計25,000円を現金で補給する。定額資金前渡制度では小口現金勘定は前渡額のまま動かさない。",
    "hints": [
      "着眼点：補給の仕訳で小口現金勘定を動かすかどうかが論点である。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "旅費交通費",
      "消耗品費",
      "通信費",
      "現金"
    ],
    "terms": [
      "小口現金",
      "補給",
      "インプレスト・システム"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "集計計算",
    "calcComplexity": 1,
    "calcProcess": "補給額 = 12,000 + 8,000 + 5,000 = 25,000"
  },
  {
    "id": "A044",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "定額資金前渡制度により小口現金50,000円を前渡ししている。用度係から、旅費交通費18,000円、消耗品費6,000円、通信費4,000円の支払報告と、手元残高20,000円の報告を受けた。不足額を含め、補給時の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "旅費交通費",
        "amount": 18000
      },
      {
        "side": "debit",
        "account": "消耗品費",
        "amount": 6000
      },
      {
        "side": "debit",
        "account": "通信費",
        "amount": 4000
      },
      {
        "side": "debit",
        "account": "雑損",
        "amount": 2000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 30000
      }
    ],
    "explanation": "支払報告の合計は28,000円だが残高から逆算した使用額は30,000円であり、差額2,000円は不足として雑損に計上する。補給額は前渡額に戻すための30,000円である。",
    "hints": [
      "着眼点：報告された支払額と、残高から分かる実際の使用額が食い違う点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "旅費交通費",
      "消耗品費",
      "通信費",
      "雑損",
      "現金"
    ],
    "terms": [
      "小口現金",
      "不足",
      "補給"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "使用額 = 50,000 - 20,000 = 30,000、不足 = 30,000 - 28,000 = 2,000"
  },
  {
    "id": "A045",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": true,
    "prompt": "小口現金の前渡額を40,000円から60,000円に増額することになり、差額を現金で用度係に渡した。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "小口現金",
        "amount": 20000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 20000
      }
    ],
    "explanation": "増額分20,000円だけ小口現金が増え、現金が同額減る。前渡額全体ではなく差額のみを記録する。",
    "hints": [
      "着眼点：記録するのは前渡額の総額ではなく増えた分だけである点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "小口現金",
      "現金"
    ],
    "terms": [
      "小口現金",
      "増額"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 1,
    "calcProcess": "増額分 = 60,000 - 40,000 = 20,000"
  },
  {
    "id": "A046",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "定額資金前渡制度により小口現金100,000円を前渡ししている。用度係から、消耗品費20,000円、旅費交通費30,000円、通信費10,000円の支払報告と、手元残高35,000円の報告を受けた。不足額を含め、補給時の仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "消耗品費",
        "amount": 20000
      },
      {
        "side": "debit",
        "account": "旅費交通費",
        "amount": 30000
      },
      {
        "side": "debit",
        "account": "通信費",
        "amount": 10000
      },
      {
        "side": "debit",
        "account": "雑損",
        "amount": 5000
      },
      {
        "side": "credit",
        "account": "現金",
        "amount": 65000
      }
    ],
    "explanation": "支払報告の合計は60,000円だが残高から逆算した使用額は65,000円であり、差額5,000円は不足として雑損に計上する。補給額は65,000円である。",
    "hints": [
      "着眼点：支払報告の合計と残高から逆算した使用額の差が不足になる点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "消耗品費",
      "旅費交通費",
      "通信費",
      "雑損",
      "現金"
    ],
    "terms": [
      "小口現金",
      "不足",
      "補給"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 3,
    "calcProcess": "使用額 = 100,000 - 35,000 = 65,000、不足 = 65,000 - 60,000 = 5,000"
  },
  {
    "id": "A047",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "普通預金の利息1,200円が普通預金口座に入金された。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "普通預金",
        "amount": 1200
      },
      {
        "side": "credit",
        "account": "受取利息",
        "amount": 1200
      }
    ],
    "explanation": "普通預金の増加を借方に、利息の受取りによる収益である受取利息を貸方に記録する。",
    "hints": [
      "着眼点：利息が現金ではなく預金口座に入る点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "普通預金",
      "受取利息"
    ],
    "terms": [
      "受取利息",
      "普通預金"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A048",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "普通預金口座から当座預金口座へ100,000円を振り替える手続をしたところ、振込手数料550円が普通預金口座から差し引かれ、当座預金口座には差引額が入金された。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "当座預金",
        "amount": 99450
      },
      {
        "side": "debit",
        "account": "支払手数料",
        "amount": 550
      },
      {
        "side": "credit",
        "account": "普通預金",
        "amount": 100000
      }
    ],
    "explanation": "当座預金への入金は手数料を差し引いた99,450円であり、手数料550円は支払手数料（費用）として計上する。普通預金の減少は振替額の100,000円である。",
    "hints": [
      "着眼点：振替額と実際の入金額の差が手数料である点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "当座預金",
      "支払手数料",
      "普通預金"
    ],
    "terms": [
      "支払手数料",
      "口座振替"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "当座預金入金額 = 100,000 - 550 = 99,450"
  },
  {
    "id": "A049",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": false,
    "prompt": "得意先に対する売掛金100,000円を回収し、60,000円は普通預金口座に、40,000円は当座預金口座にそれぞれ振り込まれた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "普通預金",
        "amount": 60000
      },
      {
        "side": "debit",
        "account": "当座預金",
        "amount": 40000
      },
      {
        "side": "credit",
        "account": "売掛金",
        "amount": 100000
      }
    ],
    "explanation": "回収額100,000円が2つの口座に分かれて入金されたため、各口座の増加を借方に分け、売掛金の減少100,000円を貸方に記録する。",
    "hints": [
      "着眼点：1つの債権の回収が複数の口座に分かれる点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "普通預金",
      "当座預金",
      "売掛金"
    ],
    "terms": [
      "売掛金",
      "複数口座"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A050",
    "version": "1.0",
    "examYear": 2027,
    "section": "q1",
    "format": "journal",
    "topic": "2-1",
    "syllabus": "第二・現金預金",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "買掛金90,000円を当座預金口座から支払ったが、支払前の当座預金残高は15,000円であり、不足分は当座借越契約により自動的に借り入れた。仕訳を示しなさい。",
    "journal": [
      {
        "side": "debit",
        "account": "買掛金",
        "amount": 90000
      },
      {
        "side": "credit",
        "account": "当座預金",
        "amount": 15000
      },
      {
        "side": "credit",
        "account": "当座借越",
        "amount": 75000
      }
    ],
    "explanation": "支払額90,000円のうち預金残高でまかなえる15,000円は当座預金の減少とし、不足する75,000円は当座借越の増加とする。",
    "hints": [
      "着眼点：借越額が支払額の大半を占める場合でも処理の考え方は同じである点に注目する。",
      "考え方：増加する要素と減少する要素を分け、資産・負債・純資産・収益・費用のどれに当たるか考える。",
      "手順：借方に置く科目と貸方に置く科目を決め、最後に借方合計と貸方合計が一致するか確かめる。"
    ],
    "accounts": [
      "買掛金",
      "当座預金",
      "当座借越"
    ],
    "terms": [
      "当座借越",
      "二勘定制"
    ],
    "lessonId": "L05",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "当座借越 = 90,000 - 15,000 = 75,000"
  },
  {
    "id": "A051",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "basic",
    "needsCalc": true,
    "prompt": "現金出納帳の当月の記録は、前月繰越高50,000円、当月の受入合計120,000円、当月の支払合計95,000円であった。翌月繰越高を求めなさい。",
    "fields": [
      {
        "key": "carry",
        "label": "翌月繰越高",
        "kind": "amount",
        "answer": 75000,
        "points": 5
      }
    ],
    "explanation": "翌月繰越高は、前月繰越高50,000円に受入合計120,000円を加え、支払合計95,000円を差し引いた75,000円である。",
    "hints": [
      "着眼点：繰越高は受入と支払の差し引きで求める点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "現金"
    ],
    "terms": [
      "現金出納帳",
      "繰越高"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "集計計算",
    "calcComplexity": 1,
    "calcProcess": "50,000 + 120,000 - 95,000 = 75,000"
  },
  {
    "id": "A052",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "voucher",
    "topic": "1-5",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "商品30,000円を現金で仕入れた。この取引を3伝票制で記録する場合に使用する伝票の種類を選びなさい。",
    "fields": [
      {
        "key": "voucher",
        "label": "使用する伝票",
        "kind": "select",
        "answer": "出金伝票",
        "points": 5,
        "options": [
          "入金伝票",
          "出金伝票",
          "振替伝票"
        ]
      }
    ],
    "explanation": "現金が減少する取引は出金伝票で記録する。商品の仕入でも、現金払いであれば出金伝票である。",
    "hints": [
      "着眼点：現金を支払う取引かどうかで伝票を判断する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "仕入",
      "現金"
    ],
    "terms": [
      "出金伝票",
      "3伝票制"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A053",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "basic",
    "needsCalc": false,
    "prompt": "仕訳帳に「（借）現金 20,000 （貸）売上 20,000」と記入された取引を総勘定元帳へ転記する。借方に記入される勘定科目を選びなさい。",
    "fields": [
      {
        "key": "debitAccount",
        "label": "総勘定元帳の借方科目",
        "kind": "account",
        "answer": "現金",
        "points": 5,
        "options": [
          "現金",
          "売上",
          "売掛金",
          "仕入"
        ]
      }
    ],
    "explanation": "仕訳帳の借方科目は、総勘定元帳のその科目の借方へ転記される。したがって借方科目は現金である。",
    "hints": [
      "着眼点：仕訳の借方・貸方がそのまま元帳の同じ側へ転記される点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "現金",
      "売上"
    ],
    "terms": [
      "転記",
      "総勘定元帳",
      "仕訳帳"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A054",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "standard",
    "needsCalc": true,
    "prompt": "当座預金出納帳の当月の記録は、前月繰越高0円、当月の預入合計200,000円、当月の引出合計130,000円であった。月末残高を求めなさい。",
    "fields": [
      {
        "key": "balance",
        "label": "月末残高",
        "kind": "amount",
        "answer": 70000,
        "points": 5
      }
    ],
    "explanation": "月末残高は、預入合計200,000円から引出合計130,000円を差し引いた70,000円である。",
    "hints": [
      "着眼点：預金出納帳でも残高の求め方は現金出納帳と同じである点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "当座預金"
    ],
    "terms": [
      "当座預金出納帳",
      "残高"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 1,
    "calcProcess": "200,000 - 130,000 = 70,000"
  },
  {
    "id": "A055",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "売上帳には、掛け売上60,000円、掛け売上45,000円、商品の戻り（返品）5,000円が記録された。売上帳から総勘定元帳の売上勘定へ転記する際の、売掛金勘定の借方合計として扱う純売上額（返品控除後）を求めなさい。",
    "fields": [
      {
        "key": "total",
        "label": "返品控除後の掛け売上合計",
        "kind": "amount",
        "answer": 100000,
        "points": 5
      }
    ],
    "explanation": "掛け売上の合計105,000円から返品5,000円を差し引くと100,000円になる。",
    "hints": [
      "着眼点：返品は売上のマイナスとして控除する点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "売上",
      "売掛金"
    ],
    "terms": [
      "売上帳",
      "返品"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "集計計算",
    "calcComplexity": 2,
    "calcProcess": "60,000 + 45,000 - 5,000 = 100,000"
  },
  {
    "id": "A056",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "仕入帳には、掛け仕入80,000円、掛け仕入35,000円、仕入れた商品の返送15,000円が記録された。返送控除後の純仕入額を求めなさい。",
    "fields": [
      {
        "key": "total",
        "label": "返送控除後の掛け仕入合計",
        "kind": "amount",
        "answer": 100000,
        "points": 5
      }
    ],
    "explanation": "掛け仕入の合計115,000円から返送15,000円を差し引いた100,000円が純仕入額である。",
    "hints": [
      "着眼点：返送は仕入のマイナスとして控除する点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "仕入",
      "買掛金"
    ],
    "terms": [
      "仕入帳",
      "返送"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "集計計算",
    "calcComplexity": 2,
    "calcProcess": "80,000 + 35,000 - 15,000 = 100,000"
  },
  {
    "id": "A057",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "standard",
    "needsCalc": true,
    "prompt": "商品有高帳のある商品は、期首在高20個（単価1,000円）、当期受入30個（単価1,000円）、当期払出35個であった。先入先出法による期末在高の金額を求めなさい。",
    "fields": [
      {
        "key": "stock",
        "label": "期末在高金額",
        "kind": "amount",
        "answer": 15000,
        "points": 5
      }
    ],
    "explanation": "期末の数量は20個に30個を加え35個を差し引いた15個であり、単価1,000円を掛けた15,000円が期末在高金額である。",
    "hints": [
      "着眼点：まず数量の残りを求め、次に単価を掛ける順序に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "商品"
    ],
    "terms": [
      "商品有高帳",
      "先入先出法"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "集計計算",
    "calcComplexity": 2,
    "calcProcess": "数量 = 20 + 30 - 35 = 15個、金額 = 15 x 1,000 = 15,000"
  },
  {
    "id": "A058",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "現金出納帳の前月繰越高は70,000円、当月の受入合計は210,000円、支払合計は235,000円であった。また月末の実際有高は43,000円であった。帳簿上の翌月繰越高と、実際有高との差額をそれぞれ求めなさい。",
    "fields": [
      {
        "key": "carry",
        "label": "帳簿上の翌月繰越高",
        "kind": "amount",
        "answer": 45000,
        "points": 3
      },
      {
        "key": "diff",
        "label": "実際有高との差額（不足額）",
        "kind": "amount",
        "answer": 2000,
        "points": 2
      }
    ],
    "explanation": "帳簿上の繰越高は70,000円に210,000円を加え235,000円を差し引いた45,000円である。実際有高43,000円との差額2,000円は不足である。",
    "hints": [
      "着眼点：繰越高を求めたうえで、実際有高と比べる2段階の計算である点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "現金",
      "現金過不足"
    ],
    "terms": [
      "現金出納帳",
      "現金過不足"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "繰越高 = 70,000 + 210,000 - 235,000 = 45,000、差額 = 45,000 - 43,000 = 2,000"
  },
  {
    "id": "A059",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "売掛金元帳のある得意先の記録は、期首残高30,000円、当期の掛け売上50,000円、当期の回収額65,000円であった。期末残高を求めなさい。",
    "fields": [
      {
        "key": "balance",
        "label": "期末残高",
        "kind": "amount",
        "answer": 15000,
        "points": 5
      }
    ],
    "explanation": "売掛金は掛け売上で増え回収で減るため、期末残高は30,000円に50,000円を加え65,000円を差し引いた15,000円である。",
    "hints": [
      "着眼点：売掛金が増える取引と減る取引を区別する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "売掛金"
    ],
    "terms": [
      "売掛金元帳",
      "補助元帳"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "30,000 + 50,000 - 65,000 = 15,000"
  },
  {
    "id": "A060",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "買掛金元帳のある仕入先の記録は、期首残高40,000円、当期の掛け仕入70,000円、当期の支払額85,000円であった。期末残高を求めなさい。",
    "fields": [
      {
        "key": "balance",
        "label": "期末残高",
        "kind": "amount",
        "answer": 25000,
        "points": 5
      }
    ],
    "explanation": "買掛金は掛け仕入で増え支払いで減るため、期末残高は40,000円に70,000円を加え85,000円を差し引いた25,000円である。",
    "hints": [
      "着眼点：買掛金は負債であり、増減の向きが売掛金と逆になる場面に注意する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "買掛金"
    ],
    "terms": [
      "買掛金元帳",
      "補助元帳"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "差額計算",
    "calcComplexity": 2,
    "calcProcess": "40,000 + 70,000 - 85,000 = 25,000"
  },
  {
    "id": "A061",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "voucher",
    "topic": "1-5",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "商品50,000円を掛けで仕入れた。この取引を3伝票制で記録する場合に使用する伝票の種類を選びなさい。",
    "fields": [
      {
        "key": "voucher",
        "label": "使用する伝票",
        "kind": "select",
        "answer": "振替伝票",
        "points": 5,
        "options": [
          "入金伝票",
          "出金伝票",
          "振替伝票"
        ]
      }
    ],
    "explanation": "現金の受払いを伴わない掛け仕入は、振替伝票で記録する。",
    "hints": [
      "着眼点：現金が動かない取引かどうかで伝票を判断する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "仕入",
      "買掛金"
    ],
    "terms": [
      "振替伝票",
      "3伝票制"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A062",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "voucher",
    "topic": "1-5",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "得意先に対する売掛金25,000円を現金で回収した。この取引を3伝票制で記録する場合に使用する伝票の種類を選びなさい。",
    "fields": [
      {
        "key": "voucher",
        "label": "使用する伝票",
        "kind": "select",
        "answer": "入金伝票",
        "points": 5,
        "options": [
          "入金伝票",
          "出金伝票",
          "振替伝票"
        ]
      }
    ],
    "explanation": "現金が増加する取引は入金伝票で記録する。売掛金の回収でも、現金を受け取れば入金伝票である。",
    "hints": [
      "着眼点：現金を受け取る取引かどうかで伝票を判断する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "現金",
      "売掛金"
    ],
    "terms": [
      "入金伝票",
      "3伝票制"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A063",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "voucher",
    "topic": "1-5",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": false,
    "prompt": "商品80,000円を仕入れ、代金のうち20,000円は現金で支払い、残額は掛けとした。この取引を3伝票制で記録する場合に使用する伝票の種類を選びなさい。",
    "fields": [
      {
        "key": "voucher",
        "label": "使用する伝票",
        "kind": "select",
        "answer": "振替伝票",
        "points": 5,
        "options": [
          "入金伝票",
          "出金伝票",
          "振替伝票"
        ]
      }
    ],
    "explanation": "一部現金払い・一部掛けのような複合取引は、3伝票制では振替伝票に記録する。現金部分だけを見て出金伝票としない点が重要である。",
    "hints": [
      "着眼点：現金払いが一部だけ含まれる複合取引の扱いに注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "仕入",
      "現金",
      "買掛金"
    ],
    "terms": [
      "振替伝票",
      "複合取引",
      "3伝票制"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A064",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "得意先ごとの売掛金の残高を確認したい。対応する補助簿を選びなさい。",
    "fields": [
      {
        "key": "book",
        "label": "対応する補助簿",
        "kind": "select",
        "answer": "売掛金元帳",
        "points": 5,
        "options": [
          "現金出納帳",
          "仕入帳",
          "売上帳",
          "商品有高帳",
          "売掛金元帳",
          "買掛金元帳",
          "固定資産台帳",
          "小口現金出納帳",
          "当座預金出納帳"
        ]
      }
    ],
    "explanation": "得意先ごとの債権残高を管理する補助簿は売掛金元帳である。",
    "hints": [
      "着眼点：知りたい情報が、取引先ごとの残高である点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "売掛金"
    ],
    "terms": [
      "売掛金元帳",
      "補助簿"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A065",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "商品ごとの受入・払出と在庫数量を確認したい。対応する補助簿を選びなさい。",
    "fields": [
      {
        "key": "book",
        "label": "対応する補助簿",
        "kind": "select",
        "answer": "商品有高帳",
        "points": 5,
        "options": [
          "現金出納帳",
          "仕入帳",
          "売上帳",
          "商品有高帳",
          "売掛金元帳",
          "買掛金元帳",
          "固定資産台帳",
          "小口現金出納帳",
          "当座預金出納帳"
        ]
      }
    ],
    "explanation": "商品ごとの受払と在庫を管理する補助簿は商品有高帳である。",
    "hints": [
      "着眼点：知りたい情報が、商品ごとの数量の動きである点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "商品"
    ],
    "terms": [
      "商品有高帳",
      "補助簿"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A066",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": false,
    "prompt": "仕訳帳に「（借）仕入 40,000 （貸）買掛金 40,000」と記入された取引について、総勘定元帳の貸方へ転記される勘定科目と金額を答えなさい。",
    "fields": [
      {
        "key": "creditAccount",
        "label": "総勘定元帳の貸方科目",
        "kind": "account",
        "answer": "買掛金",
        "points": 3,
        "options": [
          "仕入",
          "買掛金",
          "現金",
          "売掛金"
        ]
      },
      {
        "key": "amount",
        "label": "貸方金額",
        "kind": "amount",
        "answer": 40000,
        "points": 2
      }
    ],
    "explanation": "仕訳帳の貸方科目である買掛金が、総勘定元帳の買掛金勘定の貸方へ40,000円で転記される。",
    "hints": [
      "着眼点：転記では科目と金額と、記入する側がそのまま移る点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "仕入",
      "買掛金"
    ],
    "terms": [
      "転記",
      "総勘定元帳"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A067",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "小口現金出納帳の記録は、前渡額（定額）30,000円、当月の支払合計22,000円、当月に現金で補給を受けた額22,000円であった。補給後の小口現金の残高を求めなさい。",
    "fields": [
      {
        "key": "balance",
        "label": "補給後の残高",
        "kind": "amount",
        "answer": 30000,
        "points": 5
      }
    ],
    "explanation": "支払いで残高は8,000円まで減るが、同額の補給を受けたため残高は前渡額の30,000円に戻る。",
    "hints": [
      "着眼点：支払いと補給が同額である場合の残高の動きに注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "小口現金"
    ],
    "terms": [
      "小口現金出納帳",
      "インプレスト・システム"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "集計計算",
    "calcComplexity": 2,
    "calcProcess": "30,000 - 22,000 + 22,000 = 30,000"
  },
  {
    "id": "A068",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": false,
    "prompt": "購入した備品について、取得価額や耐用年数などの明細を継続して管理したい。対応する補助簿を選びなさい。",
    "fields": [
      {
        "key": "book",
        "label": "対応する補助簿",
        "kind": "select",
        "answer": "固定資産台帳",
        "points": 5,
        "options": [
          "現金出納帳",
          "仕入帳",
          "売上帳",
          "商品有高帳",
          "売掛金元帳",
          "買掛金元帳",
          "固定資産台帳",
          "小口現金出納帳",
          "当座預金出納帳"
        ]
      }
    ],
    "explanation": "固定資産の明細を管理する補助簿は固定資産台帳である。",
    "hints": [
      "着眼点：知りたい情報が、固定資産1件ごとの明細である点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "備品"
    ],
    "terms": [
      "固定資産台帳",
      "補助簿"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A069",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "standard",
    "needsCalc": false,
    "prompt": "仕訳帳に「（借）給料 90,000 （貸）現金 90,000」と記入された取引について、総勘定元帳の現金勘定の貸方へ転記される金額を求めなさい。",
    "fields": [
      {
        "key": "amount",
        "label": "現金勘定の貸方金額",
        "kind": "amount",
        "answer": 90000,
        "points": 5
      }
    ],
    "explanation": "現金は貸方科目なので、総勘定元帳の現金勘定の貸方へ90,000円が転記される。金額は仕訳の金額そのままである。",
    "hints": [
      "着眼点：転記先が現金勘定の貸方である点と、金額が変わらない点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "給料",
      "現金"
    ],
    "terms": [
      "転記",
      "総勘定元帳"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04"
  },
  {
    "id": "A070",
    "version": "1.0",
    "examYear": 2027,
    "section": "q2",
    "format": "ledger",
    "topic": "1-4",
    "syllabus": "第一・帳簿と伝票",
    "difficulty": "advanced",
    "needsCalc": true,
    "prompt": "総勘定元帳の現金勘定について、当月の借方に転記された取引は、資本金の元入れ300,000円、売掛金の回収45,000円、普通預金からの引出し80,000円であった。当月の借方合計を求めなさい。",
    "fields": [
      {
        "key": "debitTotal",
        "label": "現金勘定の借方合計",
        "kind": "amount",
        "answer": 425000,
        "points": 5
      }
    ],
    "explanation": "現金勘定の借方には現金が増える取引が集まるため、300,000円と45,000円と80,000円の合計425,000円が借方合計である。",
    "hints": [
      "着眼点：現金が増える取引だけを借方側に集める点に注目する。",
      "考え方：どの帳簿・伝票に、どの取引を記録するかを、取引の相手と現金の動きから考える。",
      "手順：与えられた数値を受入側と支払側に整理し、残高や合計を順に求める。"
    ],
    "accounts": [
      "現金",
      "資本金",
      "売掛金",
      "普通預金"
    ],
    "terms": [
      "総勘定元帳",
      "転記"
    ],
    "lessonId": "L03",
    "verified": true,
    "source": "独自作成（2027年度出題区分表対応）",
    "updatedAt": "2026-11-04",
    "calcType": "集計計算",
    "calcComplexity": 2,
    "calcProcess": "300,000 + 45,000 + 80,000 = 425,000"
  }
];
