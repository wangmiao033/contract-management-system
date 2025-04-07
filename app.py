import streamlit as st
import pandas as pd
import os
import tempfile
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="公司利润分析系统",
    page_icon="📊",
    layout="wide"
)

# 设置页面标题和说明
st.title("公司利润分析系统")
st.markdown("""
这是一个用于分析公司利润数据的系统。您可以上传Excel文件，系统会自动分析并展示数据。
支持的功能包括：
- 数据表格展示
- 基本统计分析
- 数据可视化
- 数据导出
""")

# 文件上传
uploaded_file = st.file_uploader("选择Excel文件", type=['xlsx'])

if uploaded_file is not None:
    try:
        # 创建临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            tmp_file_path = tmp_file.name

        # 读取Excel文件
        df = pd.read_excel(tmp_file_path)
        
        # 显示数据
        st.write("### 数据分析结果")
        st.dataframe(df, use_container_width=True)
        
        # 添加一些基本统计信息
        st.write("### 基本统计信息")
        st.write(df.describe())
        
        # 数据可视化
        st.write("### 数据可视化")
        
        # 选择要可视化的列
        numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns
        if len(numeric_columns) > 0:
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("#### 柱状图")
                selected_column = st.selectbox("选择要显示的列", numeric_columns)
                fig = px.bar(df, x=df.index, y=selected_column, title=f"{selected_column} 数据分布")
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                st.write("#### 折线图")
                fig = px.line(df, x=df.index, y=selected_column, title=f"{selected_column} 趋势")
                st.plotly_chart(fig, use_container_width=True)
        
        # 数据导出
        st.write("### 数据导出")
        if st.button("导出为CSV"):
            csv = df.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="下载CSV文件",
                data=csv,
                file_name='analysis_results.csv',
                mime='text/csv',
            )
        
        # 删除临时文件
        os.unlink(tmp_file_path)
        
    except Exception as e:
        st.error(f"处理文件时出错: {str(e)}")
else:
    st.info("请上传Excel文件进行分析") 