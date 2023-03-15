int f[MAXM];
int main () {
    string s,t;
    cin >> s ;
    int m=s.size();
    cin >> t ;
    int n=t.size();
    s+="$"+t;
    f[0]=0;
    for (int i=1; i<n+m+1; i++) {
        int pos=i-1;
        while (pos>=0) {
            int l=f[pos];
            if (s[l]==s[i]) {
                f[i]=l+1;
                break;
            }
            pos=l-1;
        }
        if (pos<0) f[i]=0;

        if (f[i]==m) {
            cout << i-m+1 - m << " "; /// изчисляваме реалната начална позиция в текста
        }
    }
    cout << endl ;
    return 0;
}
