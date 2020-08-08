
-- creates original recipes' table ::
CREATE TABLE [dbo].[MyRecipes](
	[user_id][UNIQUEIDENTIFIER]  NOT NULL default NEWID(),
	[recipe_id][UNIQUEIDENTIFIER] NOT NULL,
	[details][NVARCHAR](MAX) NOT NULL ,
	PRIMARY KEY (recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
)