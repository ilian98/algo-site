const long long int mod=1e9+7; /// смятаме по модул, защото бройките нарастват бързо

long long int T[MAXK][MAXK]
int k;

long long int temp[MAXK][MAXK];
void matrix_mult (long long int A[][MAXK], long long int B[][MAXK], long long int C[][MAXK]) {
    for (int row=0; row<k; row++) {
        for (int col=0; col<k; col++) {
            temp[row][col]=0;
            for (int i=0; i<k; i++) {
                temp[row][col]+=(A[row][i]*B[i][col])%mod;
            }
            temp[row][col]%=mod;
        }
    }
    for (int row=0; row<k; row++) {
        for (int col=0; col<k; col++) {
            C[row][col]=temp[row][col];
        }
    }
}
long long int R[MAXK][MAXK];
int main () {
    /// намиране на профилите и матрицата на прехода T

    int pow=1;
    while (pow<=(m-1)) {
        pow*=2;
    }
    pow/=2; /// в pow намираме най-голямата степен на двойката <= m-1
    for (int i=0; i<k; i++) { /// слагаме за начална стойност на R, единичната матрица
        R[i][i]=1;
    }
    /// ще направим итеративно бързо повдигане в степен
    while (pow>=1) {
        matrix_mult(R,R,R); /// пресмятаме R^2 и записваме резултата в R
        if (((m-1)&pow)!=0) matrix_mult(R,T,R); /// пресмятаме R*T и записваме резултата в R
        pow/=2;
    }

    int ans=0;
    for (int i=0; i<k; i++) {
        for (int j=0; j<k; j++) {
            ans+=R[i][j];
            ans%=mod;
        }
    }
    cout << ans ;
    cout << endl ;
    return 0;
}
