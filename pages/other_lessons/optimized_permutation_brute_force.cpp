long long int n,dp[1<<20][11];
const long long int mod=1e9+7;
int perm (int mask, int rem) {
    if (dp[mask][rem]!=-1) return dp[mask][rem];
    int i,curr=rem;
    curr*=10; curr%=11;
    dp[mask][rem]=0;
    for (i=1; i<=n; i++) {
        if (i==10) curr*=10, curr%=11;
        if ((mask&(1<<(i-1)))!=0) continue;
        dp[mask][rem]+=perm(mask|(1<<(i-1)),(curr+i)%11);
        dp[mask][rem]%=mod;
    }
    return dp[mask][rem];
}
int main () {
    int i;
    cin >> n ;
    memset(dp,-1,sizeof(dp));
    dp[(1<<n)-1][0]=1;
    for (i=1; i<11; i++) {
        dp[(1<<n)-1][i]=0;
    }
    cout << perm(0,0) ;
    cout << endl ;
    return 0;
}