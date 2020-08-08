
CREATE TABLE [dbo].[user_recipe_info](
    [username] [varchar](30) NOT NULL,
	[recipe_id] [UNIQUEIDENTIFIER] NOT NULL,
	[watched] [int] NOT NULL,
	[saved] [int] NOT NULL,

	FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
	FOREIGN KEY (username) REFERENCES users(username),
    
	PRIMARY KEY (username, recipe_id)
)
