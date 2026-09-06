import streamlit as st

st.title("My Voice Agent")

st.write("Welcome to my voice agent!")

name = st.text_input("Enter your name")

if st.button("Say Hello"):
    if name:
        st.success(f"Hello, {name}!")
    else:
        st.warning("Please enter your name.")