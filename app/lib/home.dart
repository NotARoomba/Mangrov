import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crystal_navigation_bar/crystal_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:mangrov/branding.dart';
import 'package:mangrov/mains/post_info.dart';
import 'package:mangrov/mains/smart.dart';
import 'package:mangrov/mains/trading.dart';
import 'package:mangrov/shortcuts/cart.dart';
import 'package:mangrov/shortcuts/chats.dart';
import 'package:mangrov/shortcuts/mix.dart';
import 'package:waterfall_flow/waterfall_flow.dart';

class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {

  Branding br = Branding();
  TextEditingController search = TextEditingController();

  int currentIndex = 0;

  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        
       
        extendBody: true,
        bottomNavigationBar: CrystalNavigationBar(
          
          unselectedItemColor: Colors.white70,
          backgroundColor: Colors.black.withValues(green: 0.1, red: 0.1, blue: 0.1, alpha: 0.4),
          borderWidth: 1,
          outlineBorderColor: Colors.white,
          currentIndex: currentIndex,
          onTap: (int i) {
              setState(() {
                currentIndex = i;
              });
            },
          items: [  

               

            CrystalNavigationBarItem(
              icon: Icons.home,
              unselectedIcon: Icons.home,
              unselectedColor: br.white,
              selectedColor: Colors.green
            ),


            CrystalNavigationBarItem(
              unselectedIcon: Icons.people,
              unselectedColor: br.white,
              icon: Icons.people,
              selectedColor: Colors.green
            ),

            CrystalNavigationBarItem(
              icon: Icons.assistant,
              unselectedIcon: Icons.assistant_outlined,
              unselectedColor: br.white,
              selectedColor: Colors.green
            ),

             CrystalNavigationBarItem(
              icon: Icons.search,
              unselectedIcon: Icons.search,
              unselectedColor: br.white,
              selectedColor: Colors.green
            ),  

             CrystalNavigationBarItem(
              icon: Icons.person,
              unselectedIcon: Icons.person,
              unselectedColor: br.white,
              selectedColor: Colors.green
            ),  
          ]
        ),
        backgroundColor: br.black,
        body: NestedScrollView(
          headerSliverBuilder: (context,innerBoxIsScrolled) => [
            SliverAppBar(
              backgroundColor: br.black,
              actions: [
                IconButton(onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => MyCart()));
                }, icon: Icon(Icons.shopping_cart_outlined, color: br.white, size: 18,)),
                IconButton(onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => Chats()));
                }, icon: Icon(Icons.question_answer, color: Colors.green[200], size: 18,)),
                IconButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (context) => MixMatch()));
                  }, 
                  icon: Icon(Icons.games, size: 18, color: Colors.green,)
                )
      
              ],
            )
          ], 
          body: SingleChildScrollView(
            scrollDirection: Axis.vertical,
            child: currentIndex == 0 ? Column(
              children: [
      
                ListTile(
                  title: Text('Welcome, user',
                  style: GoogleFonts.inter(
                    color: br.white,
                    fontSize: 20
                  ),
                  ),
                  
                  subtitle: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5.0),
                    child: Text("Shop through products present in memorable experiences. sustainably.",
                    style: GoogleFonts.inter(
                      color: br.white,
                     
                    ),
                    ),
                  ),
                ),
      
                Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 5),
                      child: TextField(
                        controller: search,
                        cursorColor: Colors.green,
                        decoration: InputDecoration(
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: Colors.grey[800]!
                            ),
                          ),
                            
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: Colors.green
                            ),
                          ),
                            
                          prefixIcon: Icon(Icons.search),
                            
                          hintText: 'Search...',
                          hintStyle: GoogleFonts.inter(
                            color: Colors.grey[700],
                            fontSize: 14
                          )
                        ),
                      ),
                    ),


                  Padding(
              padding: const EdgeInsets.symmetric(horizontal: 15.0),
              child: StreamBuilder(
                stream: FirebaseFirestore.instance.collection('posts').snapshots(), 
                builder: ((context, snapshot) {
              
                  if (snapshot.hasData) {
                    List<DocumentSnapshot> arrdata = snapshot.data!.docs;
                    return WaterfallFlow.builder(
                      physics: NeverScrollableScrollPhysics(),
                      itemCount: arrdata.length,
                      shrinkWrap: true,
                      gridDelegate: SliverWaterfallFlowDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 5.0,
                    mainAxisSpacing: 5.0,
                    lastChildLayoutTypeBuilder: (index) => index == arrdata.length
                        ? LastChildLayoutType.foot
                        : LastChildLayoutType.none,
                    ), 
                      itemBuilder: ((context, index) {

                        List images = arrdata[index]['images'];

                        return GestureDetector(
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (context) => PostInfo(
                              data: arrdata[index],
                            )));
                          },
                          child: ClipRRect(
                            borderRadius: BorderRadiusGeometry.circular(12),
                            child: Image.network(images[0], fit: BoxFit.cover,),
                          ),
                        );
                      })
                    );
                  }
              
              
                  return Lottie.asset('lib/animations/loader.json', width: 150);
                })
              ),
            )


      
              ],
            ) : currentIndex == 2 ? SmartSearch() : Trading(),
          )
        ),
      ),
    );
  }
}