num_header_cols =2
num_header_rows =2
header_rows = ['' for i in range(num_header_cols)]
n ,m = len(df), len(df.columns)



# 見出し列のnanを埋める
for i in range(num_header_rows):
    for j in range(m):
        # 1行目の場合
        if i == 0:
            if df.isna().iloc[i,j]:
                df.iloc[i,j] = df.iloc[i,j-1]
        # 2行目以降の場合
        else:
            if j==0:
                continue
            
            # 注目行よりも上の列名が１列前と同じかどうかを判定
            is_same_col = True
            for k in range(j):
                if df.iloc[k,j] != df.iloc[k,j-1]:
                    is_same_col = False
            if df.isna().iloc[i,j] and is_same_col:
                df.iloc[i,j] = df.iloc[i,j-1]        




# 見出し列
header_cols = []
for j in range(m):
    col_name = ''
    for i in range(num_header_rows):
        
        # nanの場合はスキップ
        if df.isna().iloc[i,j]:
            continue

        # 値がある場合は列名に使用
        else:
            # 列名が空白の場合、そのまま結合
            if col_name == '':
                col_name += f'{df.iloc[i,j]}'
            # 列名が空白でない場合、空白を入れて結合
            else:
                col_name += f' {df.iloc[i,j]}'
    # １列ごとにコロンを最後に結合
    col_name += '：'
    header_cols.append(col_name)

string_html = '<ul>'

for i in range(num_header_rows,n):
    is_change_header_rows = False
    for j in range(m):

        # 見出し行を除いた１行目 or 見出し列の変更があった場合
        if i == num_header_rows or is_change_header_rows:
            
            # 見出し列
            if j < num_header_cols:
                
                header_rows[j] = df.iloc[i,j]  
                string_html += f'<li>{header_cols[j]}{header_rows[j]}</li><ul>'  

            # 見出し列以外
            else:
                string_html += f'<li>{header_cols[j]}{df.iloc[i,j]}</li>'

        # 見出し行を除いた2行目以降 and 見出し列の変更がない場合
        else:
            # 見出し列
            if j < num_header_cols:

                # nanだった場合見出し列の値はそのまま
                if df.isna().iloc[i,j]:
                    continue
                
                # nanではない場合見出し列の値は入れ替え
                else:
                    header_rows[j] = df.iloc[i,j]  
                    is_change_header_rows = True
                    string_html += f'{"</ul>"*(num_header_cols+1-j)} <ul><li>{header_cols[j]}{header_rows[j]}</li> <ul>' 
                
            # 見出し列以外
            else:
                string_html +=  f'<li>{header_cols[j]}{df.iloc[i,j]}</li>'

for i in range(num_header_cols):
    string_html += '</ul>'

print(string_html) 