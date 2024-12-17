import pandas as pd

def get_user_rating(data: pd.DataFrame, asin: str) -> float:
    """
    Calculate the average user rating for a given product.
    
    Parameters:
        data (pd.DataFrame): DataFrame containing subscription data.
        asin (str): Product ASIN to calculate the rating for.
    
    Returns:
        float: Average user rating.
    """
    product_data = data[data['asin'] == asin]
    if product_data.empty:
        return 0.0  # No ratings available
    return product_data['rating'].mean()
def get_popularity_rank(data: pd.DataFrame, asin: str) -> int:
    """
    Calculate a popularity rank for a product based on review count and helpful votes.
    
    Parameters:
        data (pd.DataFrame): DataFrame containing subscription data.
        asin (str): Product ASIN to calculate the rank for.
    
    Returns:
        int: Popularity rank (lower is better).
    """
    # Aggregate popularity metrics
    data['popularity_score'] = data.groupby('asin')['helpful_vote'].transform('sum') + data.groupby('asin')['rating'].transform('count')
    
    # Rank products by popularity score (descending)
    data['popularity_rank'] = data['popularity_score'].rank(ascending=False, method='dense').astype(int)
    
    # Return the rank for the specific product
    rank = data.loc[data['asin'] == asin, 'popularity_rank']
    return rank.iloc[0] if not rank.empty else -1  # Return -1 if ASIN not found
