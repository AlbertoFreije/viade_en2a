Feature: Share a route with a friend

	Scenario: Alice wants to share a route with Bob
		Given Alice has a route
		When Alice shares the route with Bob
		Then a message appears saying that the route was shared

	Scenario: Alice wants to share a route with a group that exists
		Given Alice has a route and Alice has the group created
		When Alice shares the route with the group
		Then a message appears saying that the route was shared
		
	Scenario: Alice wants to share a route with a group that does not exist
		Given Alice has a route and Alice doesn't have the group created
		When Alice shares the route with the group
		Then a message appears warning such group does not exist
		