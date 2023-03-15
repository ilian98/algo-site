void KMP (string& t, int f[]) {
    int n=t.size(),matched=0;
    for (int start=0; start<n-m+1; ) {
        int i;
        for (i=matched; i<m; i++) {
            if (t[start+i]!=s[i]) {
                if (i==0) {
                    start++; /// ако дори първият символ не съвпада, трябва все пак да отместим стартовата позиция за следващата итерация
                    matched=0;
                }
                else {
                    start+=(i-f[i-1]);
                    matched=f[i-1];
                }
                break;
            }
        }
        if (i==m) { /// намерихме срещане на шаблона
            cout << start+1 << " ";
            start+=(m-f[m-1]); /// за да не пропуснем следващо срещане, отместваме стартовата позиция все едно сме се провалили на символ на индекс $m$
            matched=f[i-1];
        }
    }
    cout << endl ;
}
